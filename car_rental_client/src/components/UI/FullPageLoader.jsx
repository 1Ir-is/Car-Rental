import React from "react";
import ReactDOM from "react-dom";
import { Spin } from "antd";
import "../../styles/full-page-loader.css";

const FullPageLoader = ({ isLoading, tip = "Đang xử lý..." }) => {
  if (!isLoading) return null;

  return ReactDOM.createPortal(
    <div className="full-page-loader-overlay">
      <Spin size="large" tip={tip} />
    </div>,
    document.body
  );
};

export default FullPageLoader;
