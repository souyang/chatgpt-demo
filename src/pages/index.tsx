import ChatDialog from '@/components/ChatDialog';
import ThemeToggle from '@/components/ThemeToggle'
import { CHATBOT_NAME } from '@/constants';
import type { ChatCompletionRequestMessage } from 'openai';
import React, { ChangeEvent, Fragment, KeyboardEvent, useCallback, useRef, useState } from 'react'
import roles from "@/data/roleContext.json"
import CopyToClipboard from '@/components/CopyToClipboard';

export default function Home() {
  const [inputValue, setInputVaule] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);
  const [currentRole, setCurrentRole] = useState("");
  const [roleContext, setRoleContext] = useState("");
  const [conversationList, setConverstationList] = useState<ChatCompletionRequestMessage[]>([]);
  const [hintDialog, setHintDialog] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [copyText, setCopyText] = useState("copy");
  const handleInput = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setInputVaule(e.target.value)
    },
    [],
  )
  const resetUserMessage = () => {
    inputRef.current?.focus();
    setInputVaule("");
    setConverstationList([{role: "user", content: roleContext}])
  }
  const handleRoleSelect = useCallback(
     (e: ChangeEvent<HTMLSelectElement>) => {
     setCurrentRole(e.target.value)
     const context = roles.find((role) => {return role.id === e.target.value})?.context || ""
     const hintDialog = roles.find((role) => {return role.id === e.target.value})?.hintDialog || ""
     setRoleContext(context)
     setHintDialog(hintDialog)
     setCopyText("copy")
     setConverstationList([{role: "user", content: context}])
    },
    [],
  )
  const generateReply = async () => { 
        const chatHistory: ChatCompletionRequestMessage[] = [...conversationList, {role: "user", content: inputValue}]
        console.log('chatHistory', chatHistory);
        const response = await fetch("/api/openAIChat", {
          method: "POST",
          headers: {
                "Content-Type": "application/json",
            },
          body: JSON.stringify({ message: chatHistory}),
        })
        const data = await response.json()
        setInputVaule("")
        setConverstationList([...chatHistory, {role: "assistant", content: data.result}]);
  }
  const handleRefresh = () => {
    setConverstationList([])
    inputRef.current?.focus()
    setInputVaule("")
    setCurrentRole("")
  }

  const handleCopyText = () => {
    setCopyText("copied");
  }


   return( <div className='w-full'>
      <div className='flex flex-col items-end justify-center pt-20 pr-20 text-center'>
      <ThemeToggle />
      </div>
      <div className='flex flex-col items-center justify-center pt-20 text-center pr-10 pl-10'>
        
        <h1 className='text-600'>{CHATBOT_NAME}</h1>
          <div className="mt-5">
            <select className="select w-full max-w-xs select-primary" ref={roleRef} onChange={handleRoleSelect} defaultValue={'DEFAULT'}>
              <option disabled value="DEFAULT">Pick your favorite role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.id}</option>
              ))}
            </select>
          </div>
        <div className={currentRole ? 'my-12' : 'hidden'}>
          <p className='mb-6'>Please type your prompt to chat with me as <span className="font-bold">{currentRole}</span></p>
          <div className="flex flex-col md:flex-row  justify-center" >
          <CopyToClipboard text={hintDialog} copyText={copyText} onCopy={handleCopyText}/>
          </div>
          <div className="flex flex-col md:flex-row  justify-center" >
            <textarea
            placeholder='Input here'
            className= 'textarea textarea-bordered textarea-lg w-full max-w-xs'
            value={inputValue}
            onChange={handleInput}
            ref={inputRef}
            
            />
          </div>
           <div className="flex flex-col md:flex-row mt-5 justify-center">

           <button className="btn btn-primary md:ml-5 mb-5" onClick={generateReply}>Get Result</button>
            <button className="btn btn-secondary md:ml-5 mb-5" onClick={resetUserMessage}>Reset input</button>
           </div>
           <div className="flex flex-col md:flex-row mt-5 justify-center">
            <button className="btn btn-primary mb-5" onClick={handleRefresh}>new converation</button>
            </div>
      </div>
    </div>
    <div className= {currentRole ? 'w-1/2 ml-auto mr-auto' : 'hidden'}>
       <div className={showLoader ? "hidden" : "textarea"}>
        {
          conversationList.length <= 2? [] : conversationList.slice(2).map((item, index) => ( <Fragment key={index}>
          <ChatDialog item = {item}></ChatDialog>
          </Fragment>))
        }
       </div>
       <div className={!showLoader ? "hidden" : "flex items-center justify-center space-x-2"}>
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status">
          <span
          className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
          >Loading...</span>
          </div>
       </div>
    </div>
  </div>
  )
}