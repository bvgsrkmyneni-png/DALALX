function AuthScreen({
  isRegister,
  setIsRegister,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  handleLogin,
  handleRegister,
  loading
}) {
  return (
    <div className="auth-screen">
      <div
        className="auth-brand"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "7px",
          marginBottom: "28px"
        }}
      >
        <div
          className="brand-mark"
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "800",
            marginBottom: "5px"
          }}
        >
          DX
        </div>

        <strong
          style={{
            fontSize: "30px",
            lineHeight: "1",
            fontWeight: "800",
            letterSpacing: "1px"
          }}
        >
          DALALX
        </strong>

        <span
          style={{
            fontSize: "15px",
            lineHeight: "1.4",
            fontWeight: "600"
          }}
        >
          Learn • Trade • Experience
        </span>

        <span
          style={{
            fontSize: "14px",
            lineHeight: "1.4",
            fontWeight: "500"
          }}
        >
          Virtual Market Experience
        </span>
      </div>

      <div className="auth-card-new">
        <div className="auth-heading">
          <h1>
            {isRegister
              ? "Create your account"
              : "Welcome back"}
          </h1>

          <p>
            {isRegister
              ? "Start learning stock trading with virtual money."
              : "Welcome to the Virtual Market Experience."}
          </p>
        </div>

        {isRegister ? (
          <form onSubmit={handleRegister}>
            <label>Full name</label>

            <input
              type="text"
              value={registerForm.name}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  name: e.target.value
                })
              }
              placeholder="Enter your name"
              required
            />

            <label>Email</label>

            <input
              type="email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  email: e.target.value
                })
              }
              placeholder="you@example.com"
              required
            />

            <label>Password</label>

            <input
              type="password"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  password: e.target.value
                })
              }
              placeholder="Create password"
              required
            />

            <button
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <label>Email</label>

            <input
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  email: e.target.value
                })
              }
              placeholder="you@example.com"
              required
            />

            <label>Password</label>

            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value
                })
              }
              placeholder="Enter your password"
              required
            />

            <button
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        )}

        <div className="auth-switch">
          <span>
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button
            type="button"
            onClick={() =>
              setIsRegister(!isRegister)
            }
          >
            {isRegister
              ? "Sign in"
              : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;