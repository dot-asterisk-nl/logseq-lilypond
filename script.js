const prepLilyCode = (lilyCode, isMacro) => {
  const inputCode = isMacro ? lilyCode.replaceAll('[', '{').replaceAll(']', '}').replaceAll(';', ',') : lilyCode;
  return `\\include "lilypond-book-preamble.ly" 
  \\score { 
    {
      ${inputCode}
    }
    \\layout{}
    \\midi{}
  }`
}

let BASE_URL;
let USERNAME;
let PASSWORD;


logseq.ready(() => {
  console.log(logseq.baseInfo);
  const settings = logseq.baseInfo.settings;

  BASE_URL = settings.baseURL;
  USERNAME = settings.username;
  PASSWORD = settings.password;

  console.log(BASE_URL)
  if(BASE_URL){
    logseq.Editor.registerSlashCommand('Lilypond', async () => {
      await logseq.Editor.insertAtEditingCursor("{{renderer lilypond-codeblock}}\n```lilypond\n\n```");
    })

    injectLilypondRenderMacro()
  } else {
    logseq.UI.showMsg("Lilypond: Base URL not configured, please edit the settings JSON. Plugin not loaded.", 'error')
  }
  
})
.catch(console.error);


const injectLilypondRenderMacro = () => {
  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    
    const renderType = payload.arguments[0];
    if(!["lilypond-codeblock", "lilypond"].includes(renderType)) {
      return;
    }

    const full = payload.arguments[1] == "full";
    const lilyType = renderType == "lilypond" 
                                    ? "macro" 
                                    : full? "full" : "simple";
    console.log(lilyType, full, payload)

    let input = payload.arguments[1]
    let renderBlockId = null;


    if(lilyType != "macro"){
      renderBlockId = payload.uuid;
      const dataBlock = await logseq.Editor.getBlock(renderBlockId);
      const content = dataBlock.content;
      input = content.match(new RegExp("```lilypond(.*)```", "s"))[1];      
    }    

    renderLily(slot, input, renderBlockId, lilyType)
  })
  
}

const renderLily = (slot, input, renderBlockId, lilyType) => {

  const lilyCode = lilyType == "full" ? input : prepLilyCode(input, lilyType == "macro");

  Promise.all([fetchSVG(lilyCode), fetchMP3(lilyCode)])
  .then(results => {
       logseq.provideUI({
         key: '',
         reset: true,
         slot,
         template: createDiv(results[0], results[1]),            
        })
  })

  let style = `
     .lilypond-audio {
       height: 20px;
       margin-top: 10px;
     }
     .lilypond-container {
       display: inline-grid;
     }
     
  `
  
  if(lilyType != "macro") {
    style += `div[blockid="${renderBlockId}"] .cp__fenced-code-block { display: none }`;
    style += `div[blockid="${renderBlockId}"]:hover .cp__fenced-code-block { display: block }`
  }

  console.log(style)
  logseq.provideStyle(style)
}

const createDiv = (svg, audio) => {
  return `
    <div class="lilypond-container">
    ${svg}
    ${audio}
    </div>
  `
}

const fetchLily = (lilyCode, extension) => {
   return fetch(BASE_URL, {
    method: "POST", 
    body: new URLSearchParams({
      lilypond_text: lilyCode,
      extension: extension
    }),
    headers: {
      //'Authorization': 'Basic '
    }
  })
}

const fetchSVG = (lilyCode) =>  fetchLily(lilyCode, 'svg')
                                .then(response => response.text())
                                .then(svg => `<img>${svg}</img>`)

const fetchMP3 = (lilyCode) =>  fetchLily(lilyCode, 'mp3')
                                .then(response => response.blob())
                                .then(blob => {
                                  return `<audio controls="controls" class="lilypond-audio" src="${window.URL.createObjectURL(blob)}" type="audio/mp3">Your browser is unsupported.</audio>`
                                })