import { useEffect, useState } from "react";

const useScriptLoader = (scripts: string[]) => {
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNextScript = async () => {
      if (currentScriptIndex < scripts.length) {
        const scriptUrl = scripts[currentScriptIndex];
        try {
          const script = document.createElement("script");
          script.src = scriptUrl;
          script.async = true;

          script.onload = () => {
            // console.log(`Script ${currentScriptIndex + 1} loaded!`);
            setCurrentScriptIndex(currentScriptIndex + 1);
          };

          script.onerror = (error) => {
            console.error(
              `Error loading script ${currentScriptIndex + 1}:`,
              error
            );
            setError(error);
          };

          document.body.appendChild(script);
        } catch (error) {
          console.error(
            `Error loading script ${currentScriptIndex + 1}:`,
            error
          );
          setError(error);
        }
      }
    };

    loadNextScript();
  }, [currentScriptIndex, scripts]);

  return [error, currentScriptIndex === scripts.length];
};

export default useScriptLoader;

// const ScriptLoader: React.FC<ScriptLoaderProps> = ({ scripts, children }) => {
//   const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
//   const [error, setError] = useState(null);

//   const LoadNextScript = () => {
//     if (currentScriptIndex < scripts.length) {
//       const scriptUrl = scripts[currentScriptIndex];
//       useScript({
//         src: scriptUrl,
//         onload: () => {
//           console.log(`Script ${currentScriptIndex + 1} loaded!`);
//           setCurrentScriptIndex(currentScriptIndex + 1);
//         },
//         onerror: (error) => {
//           console.error(
//             `Error loading script ${currentScriptIndex + 1}:`,
//             error
//           );
//           setError(error);
//         },
//       });
//     }
//   };

//   useEffect(() => {
//     LoadNextScript();
//   }, [currentScriptIndex, scripts]);

//   if (error) {
//     console.error("Error loading scripts:", error);
//   }

//   if (currentScriptIndex === scripts.length) {
//     // All scripts have been loaded
//     return <>{children}</>;
//   } else {
//     return <div>Loading script {currentScriptIndex + 1}...</div>;
//   }
// };

// export default ScriptLoader;

// import { useEffect, useState } from "react";

// const useScript = (url: string) => {
//   const [loaded, setLoaded] = useState(false);

//   useEffect(() => {
//     const head = document.getElementsByTagName("head")[0];
//     const script = document.createElement("script");
//     script.type = "text/javascript";
//     script.src = url;
//     // script.async = true;

//     script.onload = () => {
//       setLoaded(true);
//     };

//     head.appendChild(script);

//     return () => {
//       head.removeChild(script);
//     };
//   }, [url]);

//   return loaded;
// };

// const useMultipleScripts = (urls: string[]) => {
//   const statusList = urls.map(useScript);
//   return statusList.every((status) => status === true);
// };

// export default useMultipleScripts;
