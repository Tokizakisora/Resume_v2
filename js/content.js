// 作品文字與圖片集中在這裡。圖片路徑以網站資料夾為起點；不需要網路或資料庫。
window.portfolioData = {
  updated: '2026.11',
  projects: [
    {
      id: 'puzzle', category: 'game', era: '大一課程 · 2026', tools: ['C++', '物件導向', 'DFS'],
      title: '積木拼圖與解題提示', subtitle: '把形狀、旋轉與盤面限制，拆成可處理的程式邏輯。',
      cover: 'images/projects/cpp-puzzle.svg', mediaType: '程式邏輯示意', theme: 'cream', featured: true,
      summary: '物件導向程式設計實習專案。支援關卡讀取、零件旋轉與放置，以及解答預覽和提示。',
      contribution: '大一修習賴祐吉教授物件導向課程期間的小組專案，我負責程式開發。',
      details: [
        ['資料與物件', '以 Board、Part 與 PartLocation 表達盤面、零件形狀與放置狀態，從檔案讀取關卡限制。'],
        ['座標轉換', '零件可進行 0、90、180、270 度旋轉，再把座標平移對齊到左上角，供放置檢查使用。'],
        ['搜尋與提示', '使用深度優先搜尋嘗試零件位置，檢查盤面與顏色數量限制，儲存可用解答並提供提示。']
      ],
      note: '封面依原始程式繪製，呈現邏輯概念，不是原程式的執行截圖。',
      images: [['images/projects/cpp-puzzle.svg', '積木拼圖的旋轉、限制檢查與搜尋概念示意']]
    },
    {
      id: 'triangle', category: 'robot', era: '高中競賽', tools: ['LabVIEW', '感測與控制'],
      title: '三角警示預警系統', subtitle: '讓警示裝置移動，降低人員暴露在車道上的風險。',
      cover: 'images/projects/triangle-robot.png', mediaType: '實體作品', theme: 'lilac',
      summary: '以攝影機判斷路肩白線角度，搭配全向輪、陀螺儀與超音波感測，串接校正、移動與警示流程。',
      contribution: '我負責 LabVIEW 程式開發，將感測訊號、方向校正與移動控制整合為裝置的執行流程。',
      details: [
        ['角度校正', '啟動時由攝影機取得路肩白線方向，計算角度差，再進行轉向與陀螺儀初始化。'],
        ['移動控制', '透過三輪全向輪機構執行移動，接收陀螺儀資訊以協助控制方向。'],
        ['距離偵測', '抵達目標位置後，以超音波感測後方距離，作為警示流程的輸入。']
      ],
      note: '以競賽原型驗證控制流程，真實道路情境的可靠度仍需進一步測試。',
      images: [
        ['images/projects/triangle-robot.png', '三角警示裝置的實物正面，包含 LED、攝影機、全向輪與超音波感測器'],
        ['images/projects/triangle-robot-rear.png', '裝置側背面與控制元件']
      ]
    },
    {
      id: 'app', category: 'game', era: '高中競賽 · 2023', tools: ['App Inventor', '遊戲邏輯'],
      title: '基因狂暴：恐龍復甦', subtitle: '從角色操控，到關卡、頭目戰與商店系統。',
      cover: 'images/app-battle.jpg', mediaType: '原始遊戲畫面', theme: 'peach',
      summary: '獨立完成手機遊戲程式，實作觸控攻擊、關卡進度與遊戲貨幣。全國雲端 APP 行動創意應用競賽第三名。',
      contribution: '遊戲程式由我獨立完成；隊友負責簡報。',
      details: [
        ['角色與投射物', '依角色中心和觸控位置判斷面向，設定投射物方向與速度，串接移動、攻擊及受傷流程。'],
        ['關卡與成長', '實作頭目戰、逐步增加的關卡難度，以及造型對應的能力變化。'],
        ['商店與解鎖', '以遊戲貨幣連結商城及解鎖功能，讓玩家的戰鬥成果與後續遊玩形成循環。']
      ],
      note: '成果：2023 全國雲端 APP 行動創意應用競賽第三名、基隆商工 112 學年度 APP 程式競賽第一名。',
      images: [
        ['images/app-battle.jpg', '手機遊戲的原始戰鬥畫面'],
        ['images/projects/app-blocks-direction.png', 'App Inventor 角色方向與投射物相關積木程式'],
        ['images/projects/app-blocks-actions.png', 'App Inventor 動作與判斷積木程式'],
        ['images/projects/app-flowchart.png', '作品報告中的流程圖']
      ]
    },
    {
      id: 'care', category: 'robot', era: '高中競賽 · 2025', tools: ['LabVIEW', 'myRIO', '介面整合'],
      title: '救是需藥你', subtitle: '健康照護機器人的任務流程與操作介面。',
      cover: 'images/projects/care-robot-prototype.png', mediaType: '實體原型', theme: 'mint',
      summary: '以照護場景為題，製作巡房、送藥、訂餐紀錄與模擬輪椅搬運等功能的機器人原型。',
      contribution: '我負責 LabVIEW 程式開發並參與機器組裝，將控制流程和操作介面串接起來。',
      details: [
        ['任務與控制', '以 myRIO 與 LabVIEW 接收感測器資訊，處理移動、夾取與任務執行。'],
        ['操作介面', '設計包含巡房、送藥及任務排程的護理站介面，並以家屬端與訂餐紀錄呈現不同使用情境。'],
        ['測試與改進', '原型測試顯示，僅靠超音波在複雜環境定位仍有限制；報告將光達列為後續改善方向。']
      ],
      note: '目前呈現的是競賽原型與模擬照護場景，並非已在醫院部署的系統。',
      images: [
        ['images/projects/care-robot-prototype.png', '健康照護機器人實體原型與模擬輪椅場景'],
        ['images/projects/care-robot-gripper.png', '機器人夾取物品的實測照片'],
        ['images/projects/care-nurse-interface.png', 'LabVIEW 護理站任務操作介面'],
        ['images/projects/care-family-interface.png', '家屬端操作介面'],
        ['images/projects/care-order-interface.png', '訂餐紀錄介面']
      ]
    },
    {
      id: 'chess', category: 'game', era: '大一課程 · 2026', tools: ['C++', '規則判斷', '檔案處理'],
      title: 'C++ 中國象棋', subtitle: '把棋局規則，轉換成每一步的合法性檢查。',
      cover: 'images/projects/cpp-chess.svg', mediaType: '程式邏輯示意', theme: 'lilac',
      summary: '物件導向程式設計實習專案。處理棋盤、滑鼠輸入、棋子移動、將軍判斷與存讀檔。',
      contribution: '大一物件導向實習的小組專案，我負責程式開發，將遊戲規則和操作流程落實在 C++ 程式中。',
      details: [
        ['模組拆分', '原始專案將棋盤、輸入、規則與遊戲流程分成不同模組，讓顯示與規則判斷有明確界線。'],
        ['合法移動', '檢查各棋子的移動方式、王不見王、被將軍與移動後是否使己方陷入危險。'],
        ['完整回合', '處理玩家切換、選棋與移動、無合法步的結束情況，並提供棋局儲存與讀取。']
      ],
      note: '以棋局規則和雙人操作為實作範圍，練習把例外情況納入程式判斷。',
      images: [['images/projects/cpp-chess.svg', '象棋盤面與規則檢查的示意圖，非原程式截圖']]
    },
    {
      id: 'battle', category: 'game', era: '高一課程', tools: ['C', '回合制遊戲'],
      title: '勇者鬥惡龍', subtitle: '我最早的程式作品：一場由條件與迴圈推進的戰鬥。',
      cover: 'images/c-battle.jpg', mediaType: '原始程式畫面', theme: 'ink',
      summary: '高一程式設計課期中作業。以玩家與頭目為核心，處理生命值、魔力、技能效果和回合流程。',
      contribution: '個人課程作業，由我撰寫 C 程式與整理學習報告。',
      details: [
        ['狀態與技能', '以變數與陣列記錄角色狀態、技能消耗和效果，依輸入選擇動作。'],
        ['條件與回合', '運用迴圈和 switch 條件分支，判斷魔力是否足夠、計算攻擊結果並更新戰鬥狀態。'],
        ['測試與理解', '透過遊戲流程理解輸入、條件判斷和狀態更新之間的關係，建立後續遊戲實作的基礎。']
      ],
      note: '以迴圈與條件判斷整理戰鬥流程，是後續學習模組化與物件導向的起點。',
      images: [['images/c-battle.jpg', '原始 C 文字戰鬥畫面']]
    },
    {
      id: 'robot', category: 'robot', era: '高中技能競賽', tools: ['LabVIEW', '反覆測試'],
      title: '機器人技能競賽', subtitle: '在實際機構上，反覆調整動作與控制流程。',
      cover: 'images/projects/robot-control.svg', mediaType: '控制流程示意', theme: 'cream',
      summary: '參與全國技能競賽青年組機器人職類，負責 LabVIEW coding，累積程式與實機整合經驗。',
      contribution: '我負責 LabVIEW 程式開發。備賽時與隊友針對不流暢的機器人動作進行測試和調整。',
      details: [
        ['感測與動作', '讓程式依輸入條件選擇動作，觀察控制結果與實際機構行為。'],
        ['測試與修正', '對照動作速度與協調性反覆調整，將競賽過程中的問題轉為可修改的程式流程。'],
        ['競賽成果', '第 54 屆全國技能競賽第一名、北區分區賽第二名，另獲全國工業類技藝競賽金手獎第五名。']
      ],
      note: '以控制流程示意整理備賽時的程式實作重點。',
      images: [['images/projects/robot-control.svg', '感測、判斷、動作與測試的控制流程示意']]
    },
    {
      id: 'dice', category: 'hardware', era: '高中課程', tools: ['CPLD', '數位邏輯'],
      title: 'CPLD 電子骰子', subtitle: '從真值表到亮起的 LED，驗證數位邏輯。',
      cover: 'images/projects/cpld-dice-board.png', mediaType: '實作板照片', theme: 'mint',
      summary: '由真值表、布林式與卡諾圖化簡開始，完成電路繪製、波形模擬、腳位設定與硬體驗證。',
      contribution: '可程式邏輯實習的課程成果，透過完整設計流程學習邏輯與硬體之間的對應。',
      details: [['邏輯化簡', '把輸入與骰子點數的顯示關係整理為真值表，再以布林代數和卡諾圖簡化電路。'], ['模擬與燒錄', '編譯設計、檢查模擬波形，指定腳位並下載至晶片。'], ['實體驗證', '以實作板逐一驗證輸入與 LED 輸出的對應。']],
      images: [['images/projects/cpld-dice-board.png', 'CPLD 與 LED 電子骰子實作板'], ['images/projects/cpld-dice-circuit.png', '課程報告中的邏輯電路圖']]
    },
    {
      id: 'electronics', category: 'hardware', era: '高中課程 · 2024', tools: ['介面卡', '電路與控制'],
      title: '單晶片與介面卡實作', subtitle: '把程式的輸出，接到可以看見的硬體反應。',
      cover: 'images/projects/hardware-interface-board.png', mediaType: '原始板卡照片', theme: 'cream',
      summary: '結合 74244、74273 與控制介面，練習 LED 控制、訊號傳遞、焊接與硬體驗證。',
      contribution: '單晶片微處理機與硬體裝修相關課程成果，包含介面卡製作、控制操作及學習紀錄。',
      details: [['介面與控制', '以 Visual Basic 6.0 操作介面卡 LED，觀察程式與電路輸出之間的對應。'], ['焊接與檢查', '練習一線多點焊接，配合元件配置和線路檢查完成實作。'], ['通訊練習', '報告另記錄 Arduino 與 UART 藍牙設定的課程操作經驗。']],
      note: '以控制介面與板卡驗證，練習從軟體訊號追查硬體反應。',
      images: [['images/projects/hardware-interface-board.png', '介面卡元件面與焊接實作'], ['images/projects/hardware-control-interface.png', '介面卡 LED 控制程式畫面']]
    },
    {
      id: 'modeling', category: 'hardware', era: '高中課程 · 2023', tools: ['DesignSpark', '基礎建模'],
      title: '3D 建模：手機支架', subtitle: '從日常物件出發，練習把外形轉為立體模型。',
      cover: 'images/projects/designspark-phone-stand.png', mediaType: '原始建模畫面', theme: 'peach',
      summary: '3D 列印建模課程中的 DesignSpark 實作，透過手機支架練習形體與結構設計。',
      contribution: '課程建模與學習報告，從觀察日常物件開始練習數位設計工具。',
      details: [['觀察與建模', '以生活中的物品為對象，練習將外觀與結構表達為立體模型。'], ['設計與實作', '認識 3D 建模與列印流程，思考模型造型和實際使用的關係。']],
      note: '展示的是模型截圖，並非實體列印成品照片。',
      images: [['images/projects/designspark-phone-stand.png', 'DesignSpark 中的手機支架模型']]
    }
  ],
  awards: [
    {group:'技能競賽', title:'第 54 屆全國技能競賽', detail:'青年組機器人職類', result:'第一名'},
    {group:'技能競賽', title:'第 54 屆北區分區技能競賽', projectId:'robot', detail:'青年組機器人職類', result:'第二名'},
    {group:'技能競賽', title:'全國工業類技藝競賽', projectId:'robot', detail:'機器人職種', result:'金手獎第五名'},
    {group:'程式與資料', title:'2023 全國雲端 APP 行動創意應用競賽', projectId:'app', detail:'基因狂暴：恐龍復甦', result:'第三名'},
    {group:'程式與資料', title:'2023 金象盃全國大數據實務能力競賽', detail:'高中職組', result:'全國第三名'},
    {group:'程式與資料', title:'2023 金象盃北區初賽', detail:'高中職組', result:'特優'},
    {group:'程式與資料', title:'基隆商工 112 學年度 APP 程式競賽', projectId:'app', detail:'校內競賽', result:'第一名'},
    {group:'閱讀與表達', title:'全國高級中等學校閱讀心得寫作比賽', detail:'高中期間', result:'特優、甲等 × 2'}
  ],
  certificates: [
    {name:'電腦硬體裝修', levels:['乙級','丙級']}, {name:'數位電子', levels:['乙級']},
    {name:'電腦軟體應用', levels:['丙級']}, {name:'工業電子', levels:['丙級']}, {name:'網路架設', levels:['丙級']}
  ]
};

// 展示方式與縮圖短標籤；換圖時可同步修改，不影響履歷事實。
window.portfolioPresentation = {
  triangle: {kind:'object', labels:['正面原型','側背面']},
  puzzle: {kind:'diagram', rotationPreview:true, labels:['邏輯示意']},
  app: {kind:'phone', imageKinds:['phone','interface','interface','interface'], labels:['遊戲畫面','方向判斷','動作程式','流程圖']},
  care: {kind:'photo', imageKinds:['photo','photo','interface','interface','interface'], labels:['實體原型','夾取測試','護理站','家屬端','訂餐紀錄']},
  chess: {kind:'diagram', labels:['規則示意']},
  battle: {kind:'terminal', labels:['戰鬥畫面']},
  robot: {kind:'diagram', labels:['控制流程']},
  dice: {kind:'board', labels:['實作板','電路圖']},
  electronics: {kind:'board', labels:['介面卡','控制畫面']},
  modeling: {kind:'interface', labels:['手機支架模型']}
};
