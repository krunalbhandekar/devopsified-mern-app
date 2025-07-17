import { useEffect, useState } from "react";
import { Table, Button, Input, Form, Space, Popconfirm } from "antd";
import { useMessageApi } from "./MessageProvider.jsx";
import axios from "axios";
// import "./App.css";

function App() {
  const BASE_URL = "/api/todo";
  const [todos, setTodos] = useState([]);
  const [form] = Form.useForm();
  const message = useMessageApi();
  const [loading, setLoading] = useState(false);

  const onLoad = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL);
      if (res.data.status === "error") {
        message.error(res.data.error);
      } else {
        setTodos(res.data.todos);
      }
    } catch (err) {
      message.error(err.message);
    }
    setLoading(false);
  };

  const handleAddTodo = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(BASE_URL, { title: values.title });
      if (res.data.status === "error") {
        message.error(res.data.error);
      } else {
        message.success("Todo added successfully!");
        form.resetFields();
        onLoad();
      }
    } catch (err) {
      message.error(err.message);
    }
    setLoading(false);
  };

  const handleDeleteTodo = async (id) => {
    setLoading(true);
    try {
      const res = await axios.delete(`${BASE_URL}/${id}`);
      if (res.data.status === "error") {
        message.error(res.data.error);
      } else {
        message.success("Todo deleted!");
        onLoad();
      }
    } catch (err) {
      message.error(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    onLoad();
  }, []);

  const columns = [
    {
      title: "Todo",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Delete this todo?"
            onConfirm={() => handleDeleteTodo(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 30,
    },
  ];

  return (
    <div style={{ padding: 24, margin: "0 auto" }}>
      <div>
        <h1>Todo App</h1>

        <Form layout="inline" onFinish={handleAddTodo} form={form}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please enter todo title" }]}
          >
            <Input placeholder="Enter todo" />
          </Form.Item>
          <Form.Item>
            <Button danger type="primary" htmlType="submit">
              Add Todo
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Table
        style={{ marginTop: 24 }}
        dataSource={todos}
        columns={columns}
        rowKey="_id"
        bordered
        loading={loading}
        pagination={false}
        scroll={{ y: "50vh" }}
      />
    </div>
  );
}

export default App;
