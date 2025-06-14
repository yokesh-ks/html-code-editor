import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SyntaxHighlighter } from "./syntax-highlighter";
import { toast } from "sonner";

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
  const [fontSize, setFontSize] = React.useState("14");
  const [tagStack, setTagStack] = React.useState<string[]>([]);
  const [showSyntaxHighlight, setShowSyntaxHighlight] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false); // For mobile toggle
  const [history, setHistory] = React.useState<string[]>([DEMO_HTML]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Update history when code changes (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (htmlCode !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(htmlCode);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [htmlCode, history, historyIndex]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            if (!e.shiftKey) {
              e.preventDefault();
              handleUndo();
            }
            break;
          case "s":
            e.preventDefault();
            // Save functionality could be added here
            toast.success("Use Ctrl+A, Ctrl+C to copy your code!");
            break;
          case "n":
            e.preventDefault();
            handleNewPage();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex]);

  const handleInsertTag = (tagName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = htmlCode.substring(start, end);

    // Self-closing tags
    const selfClosingTags = ["img", "br", "hr", "input", "meta", "link"];

    let newText;
    if (selfClosingTags.includes(tagName)) {
      // For self-closing tags, add common attributes
      const attributes = {
        img: ' src="" alt=""',
        input: ' type="text" name=""',
        meta: ' name="" content=""',
        link: ' rel="stylesheet" href=""',
      };
      newText = `<${tagName}${
        attributes[tagName as keyof typeof attributes] || ""
      }>`;
    } else {
      newText = `<${tagName}>${selectedText}</${tagName}>`;
      // Add to tag stack for closing
      setTagStack((prev) => [...prev, tagName]);
    }

    const newHtmlCode =
      htmlCode.substring(0, start) + newText + htmlCode.substring(end);
    setHtmlCode(newHtmlCode);

    // Set cursor position
    setTimeout(() => {
      if (selfClosingTags.includes(tagName)) {
        textarea.setSelectionRange(
          start + newText.length,
          start + newText.length
        );
      } else {
        textarea.setSelectionRange(
          start + `<${tagName}>`.length,
          start + `<${tagName}>`.length + selectedText.length
        );
      }
      textarea.focus();
    }, 0);
  };

  const handleCloseTag = () => {
    if (tagStack.length === 0) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const tagToClose = tagStack[tagStack.length - 1];
    const start = textarea.selectionStart;
    const closeTag = `</${tagToClose}>`;

    const newHtmlCode =
      htmlCode.substring(0, start) + closeTag + htmlCode.substring(start);
    setHtmlCode(newHtmlCode);
    setTagStack((prev) => prev.slice(0, -1));

    setTimeout(() => {
      textarea.setSelectionRange(
        start + closeTag.length,
        start + closeTag.length
      );
      textarea.focus();
    }, 0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHtmlCode(history[newIndex]);
    }
  };

  const handleNewPage = () => {
    setHtmlCode(
      "<!DOCTYPE html>\n<html>\n<head>\n    <title>New Page</title>\n</head>\n<body>\n    \n</body>\n</html>"
    );
    setTagStack([]);
  };

  const handleLoadDemo = () => {
    setHtmlCode(DEMO_HTML);
    setTagStack([]);
    toast.success("Demo content loaded!");
  };

  const handleCleanHTML = () => {
    // Basic HTML cleaning and formatting
    let cleaned = htmlCode
      .replace(/>\s+</g, "><") // Remove whitespace between tags
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    // Basic indentation for better readability
    let indentLevel = 0;
    const indentSize = 2;
    const selfClosingTags = [
      "img",
      "br",
      "hr",
      "input",
      "meta",
      "link",
      "area",
      "base",
      "col",
      "embed",
      "source",
      "track",
      "wbr",
    ];

    cleaned = cleaned.replace(/(<\/?[^>]+>)/g, (match) => {
      const isClosingTag = match.startsWith("</");
      const isSelfClosing =
        selfClosingTags.some((tag) =>
          match.toLowerCase().includes(`<${tag}`)
        ) || match.endsWith("/>");

      if (isClosingTag) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indent = "\n" + " ".repeat(indentLevel * indentSize);

      if (!isClosingTag && !isSelfClosing) {
        indentLevel++;
      }

      return indent + match;
    });

    setHtmlCode(cleaned.trim());
    toast.success("HTML cleaned and formatted!");
  };

  const handleCompressCode = () => {
    const compressed = htmlCode
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .trim();
    setHtmlCode(compressed);
    toast.success("Code compressed!");
  };

  return (
    <div className={`flex flex-col h-full ${className} rounded-lg overflow-hidden shadow-xl border border-indigo-500/20`}>
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="rounded-full border-indigo-300/30 hover:bg-indigo-500/20 hover:text-indigo-200"
          >
            Undo
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNewPage} 
            className="rounded-full border-purple-300/30 hover:bg-purple-500/20 hover:text-purple-200"
          >
            New Page
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLoadDemo} 
            className="rounded-full border-blue-300/30 hover:bg-blue-500/20 hover:text-blue-200"
          >
            Load Demo
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCleanHTML} 
            className="rounded-full border-emerald-300/30 hover:bg-emerald-500/20 hover:text-emerald-200"
          >
            Clean HTML
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCompressCode} 
            className="rounded-full border-amber-300/30 hover:bg-amber-500/20 hover:text-amber-200"
          >
            Compress
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="fontSize" className="text-sm font-medium text-indigo-100">
            Font Size:
          </Label>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="w-20 rounded-full border-indigo-300/30 bg-indigo-500/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-indigo-500/30">
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showSyntaxHighlight ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSyntaxHighlight(!showSyntaxHighlight)}
            className={`rounded-full ${showSyntaxHighlight ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'border-indigo-300/30 hover:bg-indigo-500/20'}`}
          >
            Syntax
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-gradient-to-br from-slate-900/80 to-slate-950/80">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col lg:border-r border-indigo-500/20">
          <div className="flex items-center justify-between p-2 border-b bg-gradient-to-r from-indigo-500/5 to-purple-500/5 backdrop-blur-sm">
            <Label className="font-medium text-sm text-indigo-200">HTML Code</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-indigo-300/70">
                {htmlCode.length} characters
              </span>
              <span className="text-xs text-purple-300/70 hidden sm:inline">
                Ctrl+Z: Undo | Ctrl+N: New
              </span>
            </div>
          </div>

          <div className="flex-1 relative">
            {showSyntaxHighlight ? (
              <div className="absolute inset-0 overflow-auto code-scrollbar">
                <SyntaxHighlighter code={htmlCode} className="h-full" />
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="h-full resize-none border-0 rounded-none font-mono bg-slate-900/50 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-0 text-slate-200 code-scrollbar"
                style={{ fontSize: `${fontSize}px` }}
                placeholder="Enter your HTML code here..."
              />
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b bg-gradient-to-r from-purple-500/5 to-indigo-500/5 backdrop-blur-sm">
            <Label className="font-medium text-sm text-purple-200">Live Preview</Label>
          </div>

          <div className="flex-1 overflow-auto bg-white rounded-br-lg code-scrollbar">
            <iframe
              srcDoc={htmlCode}
              className="w-full h-full border-0"
              title="HTML Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
