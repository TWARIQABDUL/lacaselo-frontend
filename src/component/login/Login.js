import React from "react";

function Login({ show, handleClose }) {
  return (
    <>
      {show && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-4"
              style={{ borderRadius: "18px" }}
            >
              {/* Close Button */}
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3"
                onClick={handleClose}
              ></button>

              {/* Title */}
              <h4 className="text-center fw-semibold mb-2">
                Log in or sign up
              </h4>

              <p className="text-center text-muted small mb-4">
                You’ll get smarter responses and can upload files, images, and more.
              </p>

              {/* Social Buttons */}
              <button className="btn btn-light border rounded-pill mb-3 w-100">
                Continue with Google
              </button>

              <button className="btn btn-light border rounded-pill mb-3 w-100">
                Continue with Apple
              </button>

              <button className="btn btn-light border rounded-pill mb-3 w-100">
                Continue with phone
              </button>

              {/* Divider */}
              <div className="d-flex align-items-center my-3">
                <hr className="flex-grow-1" />
                <span className="px-2 text-muted small">OR</span>
                <hr className="flex-grow-1" />
              </div>

              {/* Email Input */}
              <input
                type="email"
                className="form-control rounded-pill mb-3"
                placeholder="Email address"
              />

              {/* Continue Button */}
              <button className="btn btn-secondary rounded-pill w-100">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;