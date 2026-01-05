"use client";

import { useRef, useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Spin } from "antd";
import { makeStore, makePersistor, AppStore } from "@/store";

// Store and persistor instances (singleton pattern for client-side)
let store: AppStore | undefined;
let persistor: ReturnType<typeof makePersistor> | undefined;

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const storeRef = useRef<AppStore | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize store and persistor on client side (singleton)
  if (typeof window !== "undefined" && !store) {
    store = makeStore();
    persistor = makePersistor(store);
  }

  // For SSR, create a temporary store without persistence
  if (typeof window === "undefined" && !storeRef.current) {
    storeRef.current = makeStore();
  }

  // Loading component for PersistGate
  const loadingComponent = (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  );

  // Client-side: Use PersistGate for rehydration
  if (isClient && store && persistor) {
    return (
      <Provider store={store}>
        <PersistGate loading={loadingComponent} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    );
  }

  // Server-side or initial render: Use temporary store
  return (
    <Provider store={storeRef.current || makeStore()}>{children}</Provider>
  );
}

