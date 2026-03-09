import React from "react";

function Layout({ children }) {
  return (
    <div style={styles.wrapper}>
      
      {/* ===== MAIN CONTENT ===== */}
      <div style={styles.main}>
        
        {/* Top Header */}
        <div style={styles.topbar}>
          <h5 style={{ margin: 0 }}>La Cielo</h5>
        </div>

        {/* Page Content */}
        <div style={styles.content}>
          {children}
        </div>

      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f4f6f9"
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  topbar: {
    backgroundColor: "#1b4332",
    color: "white",
    padding: "15px 25px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },

  content: {
    padding: "25px",
    overflowY: "auto"
  }
};

export default Layout;