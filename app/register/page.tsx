"use client";

import { useEffect, useState, useRef } from "react";
import { Form, Input, Button, Card, Typography, App, Spin, Steps, Space, InputRef } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useRegisterMutation, useSendOtpMutation } from "@/store/api/authApi";
import { Role } from "@/lib/constants";

const { Title, Text } = Typography;

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  otp: string;
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormValues>>({});
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const otpInputRefs = useRef<(InputRef | null)[]>([]);
  const [form] = Form.useForm();

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, user, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (currentStep === 1 && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [currentStep]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === OTP_LENGTH) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (/^\d+$/.test(pastedData) && pastedData.length === OTP_LENGTH) {
      const newOtp = pastedData.split("").slice(0, OTP_LENGTH);
      setOtp(newOtp);
      
      // Focus last input
      otpInputRefs.current[OTP_LENGTH - 1]?.focus();
      
      // Auto-verify
      handleVerifyOtp(pastedData);
    }
  };

  const handleSendOtp = async (email: string) => {
    try {
      await sendOtp({ email }).unwrap();
      message.success("OTP sent to your email!");
      setResendCooldown(RESEND_COOLDOWN);
      setCurrentStep(1);
    } catch (error: any) {
      console.error("Send OTP error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Failed to send OTP. Please try again.";
      message.error(errorMessage);
    }
  };

  const handleVerifyOtp = (otpCode: string) => {
    // Frontend validation only - OTP will be verified on registration
    if (otpCode.length === OTP_LENGTH && /^\d{6}$/.test(otpCode)) {
      setIsOtpVerified(true);
      setCurrentStep(2);
    } else {
      message.error("Please enter a valid 6-digit OTP");
      setOtp(new Array(OTP_LENGTH).fill(""));
      otpInputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !formData.email) return;

    try {
      await sendOtp({ email: formData.email }).unwrap();
      message.success("OTP resent to your email!");
      setResendCooldown(RESEND_COOLDOWN);
      setOtp(new Array(OTP_LENGTH).fill(""));
      setIsOtpVerified(false);
      otpInputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Failed to resend OTP. Please try again.";
      message.error(errorMessage);
    }
  };

  const handleStep1Submit = async (values: Partial<FormValues>) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setFormData(values);
    await handleSendOtp(values.email!);
  };

  const handleStep2Submit = () => {
    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
      message.error("Please enter the complete OTP");
      return;
    }
    // Frontend validation - proceed to next step
    handleVerifyOtp(otpCode);
  };

  const handleFinalSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
      message.error("Please enter the complete OTP");
      return;
    }

    try {
      // OTP will be verified by the backend during registration
      const result = await register({
        name: formData.name!,
        email: formData.email!,
        role: Role.ADMIN,
        password: formData.password!,
        otp: otpCode,
        phone: formData.phone || "",
      }).unwrap();

      // Validate response structure
      if (!result.user) {
        message.error("Invalid response from server");
        return;
      }

      // Tokens are stored in httpOnly cookies by backend
      // We only need to store user data in Redux
      const userRole = result.user.role as Role;

      dispatch(
        setCredentials({
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: userRole,
            phone: result.user.phone || "",
          },
        })
      );

      message.success("Registration successful!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Registration failed. Please try again.";
      message.error(errorMessage);
      
      // If OTP is invalid/expired, reset to OTP step
      if (error?.data?.message?.includes("OTP") || error?.statusCode === 400) {
        setCurrentStep(1);
        setOtp(new Array(OTP_LENGTH).fill(""));
        setIsOtpVerified(false);
        otpInputRefs.current[0]?.focus();
      }
    }
  };

  // Show loading while checking auth state or redirecting
  if (!mounted || (mounted && isAuthenticated && user)) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--color-primary) 0%, #52c41a 100%)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const steps = [
    {
      title: "Account Info",
      icon: <UserOutlined />,
    },
    {
      title: "Verify Email",
      icon: <SafetyOutlined />,
    },
    {
      title: "Complete",
      icon: <MailOutlined />,
    },
  ];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--color-primary) 0%, #52c41a 100%)",
        padding: "24px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={2} style={{ marginBottom: "8px" }}>
            Create Account
          </Title>
          <Text type="secondary">Sign up to get started</Text>
        </div>

        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: "32px" }}
          responsive
        />

        <div suppressHydrationWarning>
          {currentStep === 0 && (
            <Form
              form={form}
              name="register-step1"
              onFinish={handleStep1Submit}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  {
                    pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                    message: "Please enter a valid phone number!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Phone (Optional)"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  { min: 6, message: "Password must be at least 6 characters!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm Password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isSendingOtp}
                  size="large"
                >
                  Continue
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 1 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <SafetyOutlined
                  style={{ fontSize: "48px", color: "var(--color-primary)", marginBottom: "16px" }}
                />
                <Title level={4}>Verify Your Email</Title>
                <Text type="secondary">
                  We've sent a 6-digit code to <strong>{formData.email}</strong>
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "24px",
                }}
              >
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    maxLength={1}
                    style={{
                      width: "48px",
                      height: "48px",
                      textAlign: "center",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleStep2Submit}
                  disabled={otp.join("").length !== OTP_LENGTH}
                >
                  Continue
                </Button>

                <div style={{ textAlign: "center" }}>
                  <Text type="secondary">Didn't receive the code? </Text>
                  {resendCooldown > 0 ? (
                    <Text type="secondary">
                      Resend in <strong>{resendCooldown}s</strong>
                    </Text>
                  ) : (
                    <Button
                      type="link"
                      onClick={handleResendOtp}
                      loading={isSendingOtp}
                      style={{ padding: 0 }}
                    >
                      Resend OTP
                    </Button>
                  )}
                </div>

                <Button
                  type="text"
                  block
                  onClick={() => {
                    setCurrentStep(0);
                    setOtp(new Array(OTP_LENGTH).fill(""));
                    setIsOtpVerified(false);
                  }}
                >
                  Change Email
                </Button>
              </Space>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "#52c41a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <SafetyOutlined style={{ fontSize: "32px", color: "#fff" }} />
                </div>
                <Title level={4}>Ready to Register!</Title>
                <Text type="secondary">
                  Review your details and click below to complete your registration.
                </Text>
              </div>

              <div style={{ marginBottom: "16px", padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
                <Text strong>Registration Details:</Text>
                <div style={{ marginTop: "8px" }}>
                  <Text type="secondary">Name: </Text>
                  <Text>{formData.name}</Text>
                </div>
                <div>
                  <Text type="secondary">Email: </Text>
                  <Text>{formData.email}</Text>
                </div>
                {formData.phone && (
                  <div>
                    <Text type="secondary">Phone: </Text>
                    <Text>{formData.phone}</Text>
                  </div>
                )}
              </div>

              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Button
                  type="primary"
                  block
                  size="large"
                  loading={isRegistering}
                  onClick={handleFinalSubmit}
                >
                  Complete Registration
                </Button>

                <Button
                  type="text"
                  block
                  onClick={() => {
                    setCurrentStep(1);
                    setOtp(new Array(OTP_LENGTH).fill(""));
                    setIsOtpVerified(false);
                  }}
                >
                  Back to OTP Verification
                </Button>
              </Space>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Text type="secondary">
            Already have an account? <Link href="/login">Sign in</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
