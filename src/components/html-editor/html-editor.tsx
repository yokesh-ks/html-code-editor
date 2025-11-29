import * as React from "react";
import Editor from "@monaco-editor/react";

const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo HTML Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .highlight { background-color: yellow; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to HTML Editor</h1>
        <p>This is a <strong>demo HTML page</strong> to showcase the editor's capabilities.</p>
        
        <h2>Features</h2>
        <ul>
            <li>Real-time preview</li>
            <li>Syntax highlighting</li>
            <li>Tag insertion</li>
            <li>Character counter</li>
        </ul>
        
        <h3>Sample Form</h3>
        <form>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" placeholder="Enter your name">
            <br><br>
            <label for="message">Message:</label>
            <textarea id="message" name="message" rows="4" cols="50"></textarea>
            <br><br>
            <button type="submit">Submit</button>
        </form>
        
        <h3>Sample Table</h3>
        <table border="1" style="border-collapse: collapse;">
            <tr>
                <th>Name</th>
                <th>Age</th>
                <th>City</th>
            </tr>
            <tr>
                <td>John Doe</td>
                <td>30</td>
                <td>New York</td>
            </tr>
            <tr>
                <td>Jane Smith</td>
                <td>25</td>
                <td>Los Angeles</td>
            </tr>
        </table>
        
        <p><em>Edit the code on the left to see changes in real-time!</em></p>
    </div>
</body>
</html>`;

interface HTMLEditorProps {
  className?: string;
}

export function HTMLEditor({ className }: HTMLEditorProps) {
  const [htmlCode, setHtmlCode] = React.useState(DEMO_HTML);
  const [theme, setTheme] = React.useState<"light" | "vs-dark">("vs-dark");

  React.useEffect(() => {
    // Check initial theme
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "vs-dark" : "light");

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "vs-dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`flex flex-row h-full ${className}`}>
      {/* Code Editor */}
      <div className="w-1/2 h-full">
        <Editor
          height="100%"
          defaultLanguage="html"
          value={htmlCode}
          onChange={(value) => setHtmlCode(value || "")}
          theme={theme}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 10, bottom: 10 },
            lineNumbers: "on",
            renderLineHighlight: "all",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
            },
          }}
        />
      </div>

      {/* Live Preview */}
      <div className="w-1/2 h-full bg-white">
        <iframe
          srcDoc={htmlCode}
          className="w-full h-full border-0"
          title="HTML Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
