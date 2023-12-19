async function initializeApp(){try{await observeQueue(updateLobbyState)}catch(e){console.error("Error initializing application:",e)}}async function fetchRankedStats(e){let t=`/lol-ranked/v1/ranked-stats/${e}`;try{return await create("GET",t)}catch(a){return console.error("Error fetching ranked stats for puuid:",e,a),null}}async function getRankedStatsForPuuids(e){try{let t=await Promise.all(e.map(fetchRankedStats));return t.map(extractSimplifiedStats)}catch(a){return console.error("Error fetching ranked stats for multiple PUUIDs:",a),[]}}function extractSimplifiedStats(e){if(!e||!e.queueMap)return"Unranked";let t=e.queueMap.RANKED_SOLO_5x5,a=e.queueMap.RANKED_FLEX_SR;return determineRank(t,a)}function determineRank(e,t){return isValidRank(e)?formatRank(e):isValidRank(t)?formatRank(t):"Unranked"}function isValidRank(e){return e&&e.tier&&e.division&&"NA"!==e.tier&&!e.isProvisional}function formatRank(e){return["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND"].includes(e.tier)?`${e.tier[0]}${romanToNumber(e.division)}`:e.tier}async function queryMatch(e,t=0,a=19){try{let r=`/lol-match-history/v1/products/lol/${e}/matches?begIndex=${t}&endIndex=${a}`,n=await create("GET",r),i=n.games.games;return!!Array.isArray(i)&&extractMatchData(i)}catch(o){return console.error("Error querying match for puuid:",e,o),!1}}function extractMatchData(e){let t={gameMode:[],championId:[],killList:[],deathsList:[],assistsList:[],Minions:[],gold:[],winList:[],causedEarlySurrenderList:[],laneList:[],spell1Id:[],spell2Id:[],items:[],types:[]};return e.forEach(e=>{let a=e.participants[0];t.gameMode.push(e.queueId),t.championId.push(a.championId),t.killList.push(a.stats.kills),t.deathsList.push(a.stats.deaths),t.assistsList.push(a.stats.assists),t.Minions.push(a.stats.neutralMinionsKilled+a.stats.totalMinionsKilled),t.gold.push(a.stats.goldEarned),t.winList.push(a.stats.win?"true":"false"),t.causedEarlySurrenderList.push(a.stats.causedEarlySurrender),t.laneList.push(a.timeline.lane),t.spell1Id.push(a.spell1Id),t.spell2Id.push(a.spell2Id);let r=[];for(let n=0;n<7;n++){let i="item"+n,o=a.stats[i];r.push(o)}t.items.push(r),t.types.push(e.gameType)}),t}async function getMatchDataForPuuids(e){try{let t=e.map(e=>queryMatch(e,0,21));return await Promise.all(t)}catch(a){return console.error("Error fetching match data for multiple PUUIDs:",a),[]}}async function observeQueue(e){try{let t=initializeWebSocket();t.onopen=()=>subscribeToGameFlow(t),t.onmessage=e,t.onerror=e=>{console.error("WebSocket Error:",e)}}catch(a){console.error("Error observing game queue:",a)}}function initializeWebSocket(){let e=getWebSocketURI();return new WebSocket(e,"wamp")}function getWebSocketURI(){let e=document.querySelector('link[rel="riot:plugins:websocket"]');if(!e)throw Error("WebSocket link element not found");return e.href}function subscribeToGameFlow(e){let t="/lol-gameflow/v1/gameflow-phase".replaceAll("/","_");e.send(JSON.stringify([5,"OnJsonApiEvent"+t]))}async function getChampionSelectChatInfo(){try{let e=await create("GET","/lol-chat/v1/conversations");return e?e.find(e=>"championSelect"===e.type):null}catch(t){return console.error("Error fetching champion select chat info:",t),null}}async function postMessageToChat(e,t){try{await create("POST",`/lol-chat/v1/conversations/${e}/messages`,{body:t,type:"celebration"})}catch(a){console.error(`Error posting message to chat ${e}:`,a)}}async function getMessageFromChat(e){try{await create("GET",`/lol-chat/v1/conversations/${e}/messages`)}catch(t){console.error(`Error getting messages from chat ${e}:`,t)}}let API_HEADERS={accept:"application/json","content-type":"application/json"};async function create(e,t,a){let r={method:e,headers:API_HEADERS,...a?{body:JSON.stringify(a)}:void 0};try{let n=await fetch(t,r);if(!n.ok)throw Error(`HTTP error! status: ${n.status}`);return await n.json()}catch(i){return console.error(`Error in create function for ${e} ${t}: ${i}`),null}}const delay=e=>new Promise(t=>setTimeout(t,e));function romanToNumber(e){let t={I:1,V:5,X:10,L:50,C:100,D:500,M:1e3},a=0,r=0;for(let n=e.length-1;n>=0;n--){let i=t[e[n]];a+=i<r?-i:i,r=i}return a}function sumArrayElements(e){return Array.isArray(e)?e.reduce((e,t)=>e+t,0):(console.error("Expected an array, received:",e),0)}function createPopup(){let e=`
        <div id="namesPopup" style="position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background-color: #1a1a1a; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); color: white; display: none; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div id="namesContent" style="margin-bottom: 10px;">Loading...</div>
            <button style="background-color: #007bff; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;" onclick="document.getElementById('namesPopup').style.display='none'">Close</button>
        </div>
    `,t=document.querySelector("body");t.insertAdjacentHTML("beforeend",e)}function populateContent(e,t,a){let r=`<p style="font-size: 14px">${e.join("<br>")}</p>`;document.getElementById("namesContent").innerHTML='<p style display: "inline">Name - Rank - Win Rate - Roles - KDA</p>'+r+t+'<p style ="font-size: 10px" display: "inline">This is a beta overlay, click <a href="https://github.com/dakota1337x/Summoner-Name-Reveal-V2" target="_blank" style="color: gold;">here</a> to see progress.<br>If you are having trouble loading names please use the slow version on github.<br>League chat services might also be down.</p>',document.getElementById("namesPopup").style.display="block";let n=document.createElement("style");n.type="text/css",n.innerHTML=`
            a { color: gold !important; }
            .celebration { color: white !important; }
        `,a.head.appendChild(n)}async function handleChampionSelect(){try{await delay(15e3);let e=await create("GET","/riotclient/region-locale"),t=e.webRegion,a=await getChampionSelectChatInfo();if(!a)return;let r=await create("GET","//riotclient/chat/v5/participants"),n=r.participants.filter(e=>e.cid.includes("champ-select")),i=n.map(e=>e.puuid),o=await getMatchDataForPuuids(i),s=await getRankedStatsForPuuids(i),l=n.map((e,t)=>formatPlayerData(e,s[t],o[t])),c=n.map((e,t)=>formatPlayerData2(e,s[t],o[t])),u=document.getElementById("embedded-messages-frame"),p=u.contentDocument||u.contentWindow.document;for(let d of l)await postMessageToChat(a.id,d);let m=n.map(e=>encodeURIComponent(`${e.game_name}#${e.game_tag}`)).join("%2C"),h=n.map(e=>encodeURIComponent(`${e.game_name}#${e.game_tag}`)).join(","),f=`https://www.op.gg/multisearch/${t}?summoners=${m}`,g=`https://porofessor.gg/pregame/${t}/${h}`,y=`<p style ="font-size: 12px" display: "inline"><a href="${f}" target="_blank" style="color: gold;">View on OP.GG</a><br><a href="${g}" target="_blank" style="color: gold;">View on Porofessor.gg</a></p>`;createPopup(),populateContent(c,y,p)}catch(b){console.error("Error in Champion Select phase:",b)}}function formatPlayerData(e,t,a){let r=calculateWinRate(a.winList),n=mostCommonRole(a.laneList),i=calculateKDA(a.killList,a.assistsList,a.deathsList);return`${e.game_name} - ${t} - ${r} - ${n} - ${i}`}function formatPlayerData2(e,t,a){let r=calculateWinRate(a.winList),n=mostCommonRole(a.laneList),i=calculateKDA(a.killList,a.assistsList,a.deathsList);return`${e.game_name} #${e.game_tag} - ${t} - ${r} - ${n} - ${i}`}async function updateLobbyState(e){try{let t=JSON.parse(e.data);"ChampSelect"===t[2].data&&await handleChampionSelect()}catch(a){console.error("Error updating lobby state:",a)}}function calculateWinRate(e){if(!e||0===e.length)return"N/A";let t=e.filter(e=>"true"===e).length,a=e.length;return`${Math.round(t/a*100)}%`}function mostCommonRole(e){if(!e)return"N/A";let t=e.reduce((e,t)=>(e[t]=(e[t]||0)+1,e),{}),a=0,r=[];for(let n in t)t[n]>a?(r=[n],a=t[n]):t[n]===a&&r.push(n);return"NA"==r||"NONE"==r||""==r?"N/A":r.join("/")}function calculateKDA(e,t,a){let r=sumArrayElements(e.map(e=>"string"==typeof e?e.split(",").map(Number):[e]).flat()),n=sumArrayElements(t.map(e=>"string"==typeof e?e.split(",").map(Number):[e]).flat()),i=sumArrayElements(a.map(e=>"string"==typeof e?e.split(",").map(Number):[e]).flat());return`${0===i?"PERFECT":((r+n)/i).toFixed(2)} KDA`}window.addEventListener("load",initializeApp);