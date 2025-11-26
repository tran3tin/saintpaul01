import React from "react";
import Header from "@components/common/Header/Header";

const App = () => {
  const toggleSidebar = () => {
    console.log("Toggle sidebar");
  };

  return (
    <div>
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={false} />
      <div className="p-4">
        <h1>Demo Header</h1>
        <p>Header đang hiển thị ở phía trên</p>
      </div>
    </div>
  );
};

export default App;
