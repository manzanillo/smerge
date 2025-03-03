interface TextDisplayProps {
  text: string;
}

const TextDisplay: React.FC<TextDisplayProps> = ({ text }) => {
  // convert string from text to html elements for nice visualisation
  // split text in lines
  // beginning with " -" will be converted to list
  // extra spaces will lead to inset list
  const getToken = (text: string) => {
    const splitIndex = text.indexOf("\n");
    if (splitIndex == -1) return [text, null];
    const token = text.substring(0, splitIndex);
    const rest = text.substring(splitIndex + 1);
    return [token, rest];
  };

  const getIndent = (text: string) => {
    const parts = text.split("");
    for (let c = 0; c < parts.length; c++) {
      const t = parts[c];
      if (t !== " ") {
        if (t === "-") {
          return c;
        } else {
          return 0;
        }
      }
    }
    return 0;
  };

  const getSameIndent = (text: string) => {
    const parts = text.split("\n");
    const baseIndent = getIndent(parts[0]);
    const ret = [parts[0]];
    const other = [];
    let end = false;
    for (let i = 1; i < parts.length; i++) {
      if (baseIndent === getIndent(parts[i]) && !end) {
        ret.push(parts[i]);
      } else {
        end = true;
        other.push(parts[i]);
      }
    }
    return [ret.join("\n"), other.join("\n")];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertTextToHtml: any = (text: string | null, level: number = 0) => {
    if (!text) {
      return;
    }
    const [token, rest] = getToken(text);
    const indent = getIndent(token ?? "");
    if (indent != 0) {
      if (level < indent) {
        if (rest) {
          const [tokenNext] = getToken(rest);
          if (getIndent(tokenNext ?? "") == level) {
            const [inner, outer] = getSameIndent(text);
            return (
              <>
                <ul style={{ margin: "0px" }}>
                  {convertTextToHtml(inner, level + 1)}
                </ul>
                {convertTextToHtml(outer, level) ?? <></>}
              </>
            );
          } else {
            return (
              <ul style={{ margin: "0px" }}>
                <li>{token?.slice(indent + 1)}</li>
                {convertTextToHtml(rest, level + 1)}
              </ul>
            );
          }
        }
        return (
          <ul style={{ margin: "0px" }}>
            <li>{token?.slice(indent + 1)}</li>
            {convertTextToHtml(rest, level + 1)}
          </ul>
        );
      } else if (rest) {
        return (
          <>
            <li>{token?.slice(indent + 1)}</li>
            {convertTextToHtml(rest, level)}
          </>
        );
      } else {
        return <li>{token?.slice(indent + 1)}</li>;
      }
    } else {
      if (rest) {
        return (
          <>
            <p
              style={{
                margin: "0px",
                fontWeight: token?.includes("**") ? "bold" : "normal",
                textDecorationLine: token?.includes("__")
                  ? "underline"
                  : "none",
              }}
            >
              {token?.replace("**", "").replace("__", "")}
            </p>
            {convertTextToHtml(rest, level)}
          </>
        );
      } else {
        return (
          <p
            style={{
              margin: "0px",
              fontWeight: token?.includes("**") ? "bold" : "normal",
              textDecorationLine: token?.includes("__") ? "underline" : "none",
            }}
          >
            {token?.replace("**", "").replace("__", "")}
          </p>
        );
      }
    }
  };

  return (
    <div style={{ justifyContent: "space-between" }}>
      {convertTextToHtml(text)}
    </div>
  );
};

export default TextDisplay;
