import React, { useState } from "react";
import { Button, Input, Modal } from "antd";

const Header = props => {
  // PROPS
  const { title, showButton, sendBusStops } = props;

  // STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [endpoint, setEndpoint] = useState("");

  // FUNCTIONS
  const handleChange = e => {
    const { value } = e.target;

    setEndpoint(value);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSend = async () => {
    const res = await sendBusStops(endpoint);
    if (res) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  };

  const ModalFooter = [
    <Button key="back" onClick={handleCancel}>
      Cancel
    </Button>,
    <Button key="submit" className="button--primary" onClick={handleSend}>
      Send
    </Button>
  ];

  const renderModal = e => {
    setModalVisible(true);
  };

  return (
    <header className="header grid-container fluid">
      <div className="grid-x align-middle align-justify width-100">
        <div className="">
          <a href="/" className="">
            <h1 className="h3 text-uppercase font-bold">{title}</h1>
          </a>
        </div>
        {showButton && (
          <div>
            <Button
              className="button--primary"
              type="primary"
              size="small"
              onClick={renderModal}
            >
              Send To Endpoint
            </Button>
            <Modal
              onCancel={handleCancel}
              title="Send Bus Stops to Endpoint"
              visible={modalVisible}
              confirmLoading={sending}
              footer={ModalFooter}
            >
              <p className="color-gray">Endpoint URL</p>
              <Input value={endpoint} onChange={handleChange} />
            </Modal>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
