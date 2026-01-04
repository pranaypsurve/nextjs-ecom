"use client";

import { Drawer, List, Button, InputNumber, Typography, Empty, Divider } from "antd";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeCart, removeFromCart, updateQuantity } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

const { Title, Text } = Typography;

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { isOpen, items } = useAppSelector((state) => state.cart);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleClose = () => {
    dispatch(closeCart());
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShoppingCartOutlined />
          <span>Shopping Cart ({items.length} items)</span>
        </div>
      }
      placement="right"
      onClose={handleClose}
      open={isOpen}
      size={400}
    >
      {items.length === 0 ? (
        <Empty
          description="Your cart is empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: "60px" }}
        >
          <Link href="/products">
            <Button type="primary">Continue Shopping</Button>
          </Link>
        </Empty>
      ) : (
        <>
          <List
            dataSource={items}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: "100%", display: "flex", gap: "12px" }}>
                  <img
                    src={item.product.images[0] || "/placeholder.jpg"}
                    alt={item.product.name}
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: "block", marginBottom: "4px" }}>
                      {item.product.name}
                    </Text>
                    <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                      {formatCurrency(item.price)}
                    </Text>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <InputNumber
                        min={1}
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(value) => handleQuantityChange(item.id, value || 1)}
                        size="small"
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(item.id)}
                      />
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <Divider />
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <Text strong>Subtotal:</Text>
              <Text strong>{formatCurrency(total)}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Shipping and taxes calculated at checkout
            </Text>
          </div>
          <Link href="/checkout" style={{ display: "block" }}>
            <Button type="primary" block size="large" onClick={handleClose}>
              Proceed to Checkout
            </Button>
          </Link>
        </>
      )}
    </Drawer>
  );
}

