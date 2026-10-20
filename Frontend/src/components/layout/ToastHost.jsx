import { Toaster } from "react-hot-toast";

export default function ToastHost() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#3d1e1b",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
        },
      }}
    />
  );
}
