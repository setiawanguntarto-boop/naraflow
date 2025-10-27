export const Footer = () => {
  return (
    <footer className="bg-surface-muted border-t border-border-light py-8">
      <div className="container mx-auto px-6 text-center">
        <p className="text-foreground-muted">
          © {new Date().getFullYear()} Naraflow. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
