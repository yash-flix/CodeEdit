import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import {
  useRef,
  useMemo,
  useState,
  useEffect
} from "react"

import * as Y from "yjs"
// import { SocketIOProvider } from "y-socket.io"
import { WebsocketProvider } from "y-websocket"

function App() {

  // USERNAME
 

  const [username, setUsername] = useState(() => {
    return (
      new URLSearchParams(window.location.search)
        .get("username") || ""
    );
  });


  // ONLINE USERS


  const [users, setUsers] = useState([]);

 
  // MONACO READY STATE


  const [editorReady, setEditorReady] =
    useState(false);

  
  // MONACO EDITOR REF
 

  const editorRef = useRef(null);


  // YJS DOCUMENT


  const ydoc = useMemo(() => {
    return new Y.Doc();
  }, []);

  
  // SHARED TEXT


  const ytext = useMemo(() => {
    return ydoc.getText("monaco");
  }, [ydoc]);


  // RANDOM USER COLOR
 

  const userColor = useMemo(() => {

    const colors = [
      "#ef4444",
      "#3b82f6",
      "#22c55e",
      "#f59e0b",
      "#a855f7",
      "#ec4899"
    ];

    return colors[
      Math.floor(Math.random() * colors.length)
    ];

  }, []);

  
  // MONACO MOUNT
  

  const handleMount = (editor) => {

    editorRef.current = editor;

    setEditorReady(true);
  };

 
  // JOIN ROOM


  const handleJoin = (e) => {

    e.preventDefault();

    const enteredUsername =
      e.target.username.value;

    setUsername(enteredUsername);

    window.history.pushState(
      {},
      "",
      "?username=" + enteredUsername
    );
  };

 
  // SOCKET PROVIDER
  

  const provider = useMemo(() => {

    if (!username) return null;

    return new WebsocketProvider(
      "ws://localhost:1234",
      "monaco",
      ydoc,
      {
        autoConnect: true
      }
    );

  }, [username, ydoc]);

 
  // COLLABORATION EFFECT
 

  useEffect(() => {

    if (
      !username ||
      !editorReady ||
      !provider
    ) {
      return;
    }

   
    // USER PRESENCE
    

    provider.awareness.setLocalStateField(
      "user",
      {
        username,
        color: userColor
      }
    );
    
    provider.awareness.setLocalStateField( "cursor", { anchor: 0, head: 0 } );

   
    // ONLINE USERS LISTENER
 

    const handleAwarenessChange = () => {

      const states = Array.from(
        provider.awareness
          .getStates()
          .values()
      );

      const uniqueUsers = [
        ...new Map(
          states
            .filter(
              state =>
                state.user?.username
            )
            .map(state => [
              state.user.username,
              state.user
            ])
        ).values()
      ];

      setUsers(uniqueUsers);
    };

    provider.awareness.on(
      "change",
      handleAwarenessChange
    );


    // INITIAL USERS


    handleAwarenessChange();


    // INITIAL DOCUMENT


    if (ytext.length === 0) {

      ytext.insert(
        0,
        "// Start coding...\n"
      );
    }


    // MONACO BINDING


    const monacoBinding =
      new MonacoBinding(
        ytext,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness
      );


    // TAB CLOSE HANDLER


    const handleBeforeUnload = () => {

      provider.awareness
        .setLocalStateField(
          "user",
          null
        );
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

   
    // CLEANUP
   

    return () => {

      monacoBinding.destroy();

      provider.awareness.off(
        "change",
        handleAwarenessChange
      );

      provider.disconnect();

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };

  }, [
    username,
    editorReady,
    provider,
    ytext,
    userColor
  ]);

 
  // JOIN SCREEN
 

  if (!username) {

    return (

      <main className="
        min-h-screen
        w-full
        bg-gradient-to-br
        from-gray-950
        via-black
        to-gray-900
        flex
        items-center
        justify-center
        px-4
      ">

        <div className="
          w-full
          max-w-md
          bg-white/5
          backdrop-blur-lg
          border
          border-white/10
          rounded-3xl
          shadow-2xl
          p-8
        ">

          <div className="
            flex
            flex-col
            items-center
            mb-8
          ">

            <h1 className="
              text-4xl
              font-bold
              text-white
              tracking-tight
            ">
              CodeCollab
            </h1>

            <p className="
              text-gray-400
              mt-2
              text-sm
              text-center
            ">
              Real-time collaborative
              code editor
            </p>

          </div>

          <form
            className="
              flex
              flex-col
              gap-5
            "
            onSubmit={handleJoin}
          >

            <div className="
              flex
              flex-col
              gap-2
            ">

              <label className="
                text-sm
                text-gray-300
              ">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                name="username"
                className="
                  w-full
                  bg-gray-900/80
                  text-white
                  placeholder:text-gray-500
                  border
                  border-gray-700
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  transition-all
                  duration-200
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/30
                "
              />

            </div>

            <button
              className="
                w-full
                bg-blue-600
                hover:bg-blue-500
                active:scale-[0.98]
                transition-all
                duration-200
                text-white
                font-semibold
                py-3
                rounded-xl
                shadow-lg
                shadow-blue-500/20
              "
            >
              Join Room
            </button>

          </form>

        </div>

      </main>
    );
  }


  // MAIN EDITOR UI


  return (

    <main className="
      h-screen
      w-full
      bg-gray-950
      flex
      gap-4
      p-4
    ">

     
      {/* SIDEBAR */}
      

      <aside className="
        h-full
        w-1/4
        bg-neutral-900
        rounded-lg
        p-4
        border
        border-neutral-800
      ">

        <h2 className="
          text-lg
          font-bold
          text-white
          mb-4
        ">
          Online Users
        </h2>

        <ul className="
          space-y-2
        ">

          {users.map((user, index) => (

            <li
              key={index}
              className="
                flex
                items-center
                gap-2
                bg-neutral-800
                px-3
                py-2
                rounded-lg
              "
            >

              <div
                className="
                  w-3
                  h-3
                  rounded-full
                "
                style={{
                  backgroundColor:
                    user.color
                }}
              />

              <span className="
                text-gray-200
              ">
                {user.username}
              </span>

            </li>
          ))}

        </ul>

      </aside>

     
      {/* MONACO EDITOR */}
     

      <section className="
        w-3/4
        bg-neutral-800
        rounded-lg
        overflow-hidden
      ">

        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={handleMount}
          options={{
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true
  }}
        />

      </section>

    </main>
  );
}

export default App;