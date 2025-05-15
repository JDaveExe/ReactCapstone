            </div>
          </Form>
        )}
      </div>
    );
  };
  
  // Main component render
  return (
    <Container fluid className="auth-container p-0">
      <Row className="m-0 h-100">
        <Col lg={6} className="auth-left d-flex flex-column justify-content-center p-4 p-lg-5">
          <div className="logo-container mb-4 d-flex align-items-center">
            <img src={logoImage} alt="Maybunga Health Center Logo" className="logo-image me-3" />
            <h3 className="m-0">Maybunga Health Center</h3>
          </div>
          <div className="welcome-message mt-4">
            <h1 className="display-4 fw-bold text-white">Welcome to the Official Health Care System</h1>
            <p className="subtitle text-white fs-5 mt-3">Register or log in to access your health records and services</p>
          </div>
        </Col>
        <Col lg={6} className="auth-right d-flex align-items-center justify-content-center p-4">
          <Card className="auth-card border-0 shadow">
            <Card.Body className="p-4 d-flex flex-column align-items-center">
              <div className="form-container w-100 d-flex flex-column align-items-center">
                <Nav variant="tabs" className="auth-tabs mb-4" activeKey={activeTab} onSelect={handleTabChange}>
                  <Nav.Item>
                    <Nav.Link eventKey="login" className="fw-bold">Login</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="register" className="fw-bold">Register</Nav.Link>
                  </Nav.Item>
                </Nav>
   
                {activeTab === 'login' ? renderLoginForm() : renderRegistrationForm()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
 
export default AuthPage;
