import "./App.css"
import {Editor} from "@monaco-editor/react"
import {MonacoBinding} from "y-monaco"
import {useRef  , useMemo , useState , useEffect} from "react"
import * as Y from "yjs"
import {SocketIOProvider} from "y-socket.io"

function App() {
const [username , setUsername] = useState(()=>
{
  return new URLSearchParams(window.location.search).get("username") || "";
});
const [users , setUsers] = useState([]);
const [editorReady , setEditorReady] = useState(false);
// stores editor instance
const editorRef = useRef(null);

 // create shared Yjs document
 const ydoc = useMemo(()=> new Y.Doc(),[]);
 const ytext = useMemo(()=> ydoc.getText("monaco"), [ydoc]);


const handleMount = (editor)=>
{
  editorRef.current = editor; //actual Monaco editor instance
  setEditorReady(true);
}
const handleJoin = (e)=>
{
  e.preventDefault();
  setUsername(e.target.username.value);
  window.history.pushState({} , "", "?username=" + e.target.username.value);
}
const provider = useMemo(() => {

  if (!username) return null

  return new SocketIOProvider(
    "http://localhost:3000",
    "monaco",
    ydoc,
    { autoConnect: true }
  )

}, [username, ydoc])
useEffect(()=>
{
if(!username || !editorReady || !provider) return;

  provider.awareness.setLocalStateField("user" , {username});
  provider.awareness.on("change" , ()=>
  {
    const states = Array.from(provider.awareness.getStates().values());
    setUsers(states.filter(state=> state.user?.username).map(state=> state.user));
  })

 function handleBeforeUnload()
 {
  provider.awareness.setLocalStateField("user" , null);
 }

 window.addEventListener("beforeunload" , handleBeforeUnload);

if (ytext.length === 0) {
  ytext.insert(0, "// Start coding...\n")
}

  const monacoBinding = new MonacoBinding( //translator between Monaco and Yjs
    ytext ,
    editorRef.current.getModel() ,    //actual text document inside Monaco
    new Set([editorRef.current]) ,   
    provider.awareness //live user cursor/selection data
  );
  return()=>
  {
    monacoBinding.destroy();
    provider.disconnect();
    window.removeEventListener("beforeunload" , handleBeforeUnload);
  
}

} , [editorReady, username])

  if (!username)
  {
    return (
      
      <main className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center px-4">

  <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-8">

    <div className="flex flex-col items-center mb-8">
      <h1 className="text-4xl font-bold text-white tracking-tight">
        CodeCollab
      </h1>

      <p className="text-gray-400 mt-2 text-sm text-center">
        Real-time collaborative code editor
      </p>
    </div>

    <form
      className="flex flex-col gap-5"
      onSubmit={handleJoin}
    >

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-300">
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
            border border-gray-700
            rounded-xl
            px-4
            py-3
            outline-nonez
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
    )
  }

  return (
   <main className="h-screen w-full bg-gray-950 flex gap-4 p-4" >
    
    <aside className="h-full w-1/4 bg-amber-100 rounded-lg" ></aside>

    <section className="w-3/4 bg-neutral-800 rounded-lg">
    <Editor height="100% "
            defaultLanguage = "javascript"
            theme="vs-dark"
            onMount={handleMount}
            /> </section>

   </main>
  )
}

export default App
