interface FooterProps {
  type?: "default" | "fixed" | "mini";
}

const Footer = ({ type = "default" }: FooterProps) => {
  return (
    <footer
      className={`footer ${type === "fixed" ? "footer--fixed" : type === "mini" ? "footer--mini" : ""}`}
    >
      <div className="footer-top">
        <div className="footer-links">
          <p className="footer-more-info">
            Learn about Super Debunkers in a classroom setting, visit our
            website{" "}
            <a
              href="https://www.projectreal.co.uk/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Project Real (opens in a new tab)"
            >
              Project Real
            </a>
          </p>
        </div>
        <div className="footer-companies">
          <p className="footer-main-text footer-spaced">
            A game by Project Real in conjunction with Design for Good
          </p>
          <p className="footer-main-text">
            Made with ❤️ by a team of volunteers
          </p>
        </div>
      </div>
      <hr />

      <div className="footer-copyright">
        <p className="footer-secondary-text">
          &copy; 2026 Super Debunkers. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
