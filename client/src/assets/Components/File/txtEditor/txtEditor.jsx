
//DESC: This is the rich text editor and the chatbot

import ExampleTheme from "./themes/themeEditor";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import React, {useEffect, useState} from "react";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { useRef } from "react";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import StateUpdater  from "./plugins/htmlPlugin"
import { getFunctions, httpsCallable } from "firebase/functions";
import {app,storage} from "../../../../firebase"
import { getDownloadURL, ref} from 'firebase/storage';
import 'firebase/functions';
//GPT
import ChatMessage from "../chatMessage"


export default function Editor({setData,setContent,audioUrl,passTranscription,isSubscribed}) {


//<********************  INITIAL STATE LOAD  ********************>

const [initialEditorState, setInitialEditorState] = useState(null)

const loadContent = async () => {
  // 'empty' editor
  const value = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';
  return value;
}

useEffect(() => {
  if ( initialEditorState != null ){
  const initialEditorState = loadContent();
  setInitialEditorState(initialEditorState)
  }
},[])

//<********************  Config ********************>

const editorConfig = {
  // The editor theme
  theme: ExampleTheme,
  editorState: initialEditorState,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode
  ]
};

const editorStateRef = useRef();


//<********************  Variables  ********************>

const functions = getFunctions(app);

//AI CHATBOT
const [aiTxt,setAiTxt] = useState("")
const [chatLog,setChatLog] = useState([])

//AI TOGGLE STATES
const [questionLoading, setQuestionLoading] = useState(false)
const [isFirstQuestion,setIsFirstQuestion] = useState(true)
const [isAiActive,setIsAiActive] = useState(false)

//ANALYZE SCIPT
const [isScriptLoading, setIsScriptLoading] = useState(false)
const [isScriptLoaded, setIsScriptLoaded] = useState(false)
const [transcriptScript,setTranscriptScript] = useState("")
const [summerisingIsLoading,setSummerisingIsLoading] = useState(false)


//<********************  Functions  ********************>

// <===> VIDEO TRANSCRIPTION FETCH  <===>

const fetchTranscription = async (transcription) => {

  const data = await fetch(transcription)
  if (!data.ok) {
    throw new Error('Network response was not ok');
  }
  const dataJson = await data.json()
  return dataJson
    
}

// <===> PROMPT QUESTION --> ANSWER HANDLER  <===>

const generateTextFromPrompt = async (request) => {
  const generateTextFunction = httpsCallable(functions, 'openAIHttpFunctionSec');
  if(request.type == "analasys"){
    const userQuestionShow = "[ SCRIPT ANALISYS ] " + aiTxt
    let chatLogNew = [...chatLog, {user: "me", message: `${userQuestionShow}`} ]
    try {
      const result = await generateTextFunction({name: request.message});

      setQuestionLoading(false)
      setChatLog([...chatLogNew, {user: "gpt", message: `${result.data.data.choices[0].message.content}`}])
    } catch (error) {
      console.error('Firebase function invocation failed:', error);
    }
  } else if(request.type == "text"){
    const userQuestionShow = aiTxt
    let chatLogNew = [...chatLog, {user: "me", message: `${userQuestionShow}`} ]
    try {
      const result = await generateTextFunction({name: request.message});

      setQuestionLoading(false)
      setChatLog([...chatLogNew, {user: "gpt", message: `${result.data.data.choices[0].message.content}`}])
    } catch (error) {
      console.error('Firebase function invocation failed:', error);
    }
  } else if(request.type == "sum"){
    const userQuestionShow = "[ SUMMERY IN PROCESS ] "
    let chatLogNew = [...chatLog, {user: "me", message: `${userQuestionShow}`} ]
    try {
      const result = await generateTextFunction({name: request.message});

      setChatLog([...chatLogNew, {user: "gpt", message: `${result.data.data.choices[0].message.content}`}])
      setSummerisingIsLoading(false)
      setQuestionLoading(false)
    } catch (error) {
      console.error('Firebase function invocation failed:', error);
    }
    } else {
      alert("Something went wrong. Please Refresh the page !")
    }
};

const handleEnterPress = (e) => {
  if (e.key === 'Enter') {

    if(questionLoading == false){
      e.preventDefault();
      setQuestionLoading(true)
      setIsScriptLoaded(false)

      if ( transcriptScript != "" ){
        const  question = "( " + transcriptScript + " )" + "this is a video script," + " " + aiTxt;
        const userQuestionShow = "[ SCRIPT ANALISYS ] " + aiTxt
        let chatLogNew = [...chatLog, {user: "me", message: `${userQuestionShow}`} ];

        setChatLog([...chatLogNew, {user: "gpt", message: "Answering..."}]);
        const request = {
          message: question,
          type: "analasys"
        };
        generateTextFromPrompt(request)
      } else if (transcriptScript == "") {
        const  question =  aiTxt;
        let chatLogNew = [...chatLog, {user: "me", message: `${question}`} ];
        setChatLog([...chatLogNew, {user: "gpt", message: "Answering..."}]);
        const request = {
          message: question,
          type: "text"
        };
        generateTextFromPrompt(request);
      }

      setIsFirstQuestion(false)
      setAiTxt("")
      setTranscriptScript("")
    } else {
      alert("Wait for the answer !")
    }
  }
};

const handleSummerising = async () =>{
  setSummerisingIsLoading(true)
  setQuestionLoading(true)
  const audioMetaName = `${audioUrl + ".wav_transcription.txt"}`
  const transRef = ref(storage,audioMetaName)
  const transcription = await getDownloadURL(transRef)
  try{
    const data = await fetchTranscription(transcription)
    const querySnaphot = data.results
    const userFolders = [];
    querySnaphot.forEach((doc) => {
      userFolders.push(doc.alternatives[0].transcript);
    });

    const concatenatedText = userFolders.map(doc => doc).join(' ');
    passTranscription(concatenatedText);

    const  question = "( " + concatenatedText + " )" + " summerise this video script";
    const userQuestionShow = "[ SUMMERY IN PROCESS ] ";
    let chatLogNew = [...chatLog, {user: "me", message: `${userQuestionShow}`} ];
    setChatLog([...chatLogNew, {user: "gpt", message: "Answering..."}]);
    const request = {
      message: question,
      type: "sum"
    };
    generateTextFromPrompt(request);
    setIsFirstQuestion(false)
    setTranscriptScript("")
  } catch (error) {
    console.error('Firebase function invocation failed:', error);
    alert("Something went wrong. Please Refresh the page !")
    setSummerisingIsLoading(false)
    setQuestionLoading(false)
  }
}


// <===> ANALIZE THE VIDEO FEATURE  <===>

const handleScriptLoading = async () =>{
  setIsScriptLoading(true)
  try{
    const audioMetaName = `${audioUrl + ".wav_transcription.txt"}`
    const transRef = ref(storage,audioMetaName)
    const transcription = await getDownloadURL(transRef)

    const data = await fetchTranscription(transcription)

    const querySnaphot = data.results  
    const userFolders = [];
    querySnaphot.forEach((doc) => {
      userFolders.push(doc.alternatives[0].transcript);
    });
    const concatenatedText = userFolders.map(doc => doc).join(' ');
    passTranscription(concatenatedText);
    setTranscriptScript(concatenatedText)
    
    setIsScriptLoading(false)
    setIsScriptLoaded(true)
  } catch (error) {
    console.log('Firebase Storage error code:', error.code); // Add this line for debugging
    if ('storage/object-not-found' === error.code) {
      alert('Sorry, The Added Video is too Fresh, Try Again in 3 minutes ');
    } else {
      console.error('Firebase function invocation failed:', error);
    }
    setIsScriptLoading(false);
  }
}

const handleScriptLoaded = () => {
  setTranscriptScript("")
  setIsScriptLoaded(false)
};


//<********************  Components  ********************>

function SimpleRichTextEditor() {
  return(
    <div className={`editor-inner ${!isFirstQuestion ? 'active' : ''}`}>
    <RichTextPlugin
      contentEditable={
        <ContentEditable className="editor-input" />
      }
      ErrorBoundary={LexicalErrorBoundary}
    />
    <OnChangePlugin 
      onChange={editorState => editorStateRef.current = editorState}
    />
    <OnChangePlugin 
      onChange={() => {
        if (editorStateRef.current) {
          setContent(JSON.stringify(editorStateRef.current))
        }
      }}
    />
    <StateUpdater initialHtml={`${setData}`} />
    <HistoryPlugin />
    <TreeViewPlugin />
    <AutoFocusPlugin />
    <CodeHighlightPlugin />
    <ListPlugin />
    <LinkPlugin />
    <AutoLinkPlugin />
    <ListMaxIndentLevelPlugin maxDepth={7} />
    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
  </div>
  )
}

function AiChat() {

  // AI INPUT SECTION UI
  function AiInputUI(){

    return(
      <>
        <div className="feature-boxes">
        { !isScriptLoaded ? ( 
          !isScriptLoading ? ( 
            <div className="feature_1"  onClick={handleScriptLoading}>
                <h2>Analyze the Script</h2>
                <h5>Ask your question if it's highlighted</h5>
            </div>
          ):(
            <div className="feature_1">
              <h2>Scipt Loading</h2>
              <h5>It may take some times...</h5>
            </div>
          )
        ):(
          <div className="feature_1" style={{borderColor:"aquamarine"}} onClick={handleScriptLoaded}>
            <h2>Scipt is Ready</h2>
            <h5>Ask Anyithing I Click to Undo</h5>
          </div>
        )}
        {!summerisingIsLoading?(
          <div className="feature_2" onClick={handleSummerising}>
            <h2>Summarise the video</h2>
            <h5>However you want</h5>
          </div>
        ):(
          <div className="feature_2" style={{borderColor:"aquamarine"}} onClick={handleSummerising}>
            <h2>Processing</h2>
            <h5>It may take some times</h5>
          </div>
        )}
        </div>
        {!isScriptLoaded ? (
          <input type="text" value={aiTxt} className="ai-input" placeholder="Ask me anything" onChange={(e) => setAiTxt(e.target.value)} onKeyPress={handleEnterPress}/>
        ):(
          <input type="text" value={aiTxt} className="ai-input" placeholder="The Video Script is Loaded" onChange={(e) => setAiTxt(e.target.value)} onKeyPress={handleEnterPress}/>
        )}
      </>
    )
  }

  // 1.) STAGE - QUESTION UI
  function InitialUI() {
    return(
      <div className="ai-input-cont">
        <h1 className="ai_title">Use Clippify Ai</h1>
        {AiInputUI()}
      </div>
    )
  }

  // 2.) STAGE -  AI CHAT UI
  function AiChatUI() {
    return(
      <>
        <div className="editor-inner2">
          <div className="chat-cont">
              <h1 className="chat-log-title">Chat Log</h1>
              <hr className="chat-log-hr"/>
              {chatLog.map((message,index) => (
                <ChatMessage key={index} message={message}/>
              ))}
          </div>
        </div>

        <div className="input_bar_2_stage">
          {AiInputUI()}
        </div>
      </>
    )
  }

  return(
    <div className={`editor-inner ${!isFirstQuestion ? 'active' : ''}`}>
    {isFirstQuestion ? (
      InitialUI()
    ) : (
      AiChatUI()
    )}
    </div>
  )
}

return (
<LexicalComposer initialConfig={editorConfig}>
  <div className="editor-container">
    <ToolbarPlugin isActive={setIsAiActive} />
    {!isAiActive ? (
      SimpleRichTextEditor()
    ) : (
      AiChat()

    )}
  </div>
</LexicalComposer>
);
}
