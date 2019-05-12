let base62charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

// AVATAR
let avatarWidth = 8
let avatarHeight = 8

let avatarTile =
'  ****  ' +
'  ****  ' +
'  ****  ' +
'  ****  ' +
' ****** ' +
'  ****  ' +
'  *  *  ' +
'  *  *  '
    
let avatarPosX = 0
let avatarPosY = 0

let numKeys, numGems
let removedItems

// TILES
let tileWidth = 8
let tileHeight = 8

let tileTypes = [
    'empty',
    'start',
    'block',
    'earth',
    'gem',
    'key',
    'lock',
    'up',
    'down',
    'fire'
]

let tiles = {
    'avatar0':
    '  ****  ' +
    '  ****  ' +
    '  ****  ' +
    '  ****  ' +
    ' ****** ' +
    '  ****  ' +
    '  *  *  ' +
    '  *  *  '
    ,
    'avatar1':
    '        ' +
    '  ****  ' +
    '  ****  ' +
    '  ****  ' +
    '  ****  ' +
    ' ****** ' +
    '  ****  ' +
    '  *  *  '
    ,
    'empty':
    '        ' +
    '        ' +
    '        ' +
    '        ' +
    '        ' +
    '        ' +
    '        ' +
    '        '
    ,
    'start':
    '********' +
    '*      *' +
    '* **** *' +
    '* *  * *' +
    '* *  * *' +
    '* **** *' +
    '*      *' +
    '********'
    ,
    'block':
    '********' +
    '********' +
    '********' +
    '********' +
    '********' +
    '********' +
    '********' +
    '********'
    ,
    'earth':
    '* * * * ' +
    ' * * * *' +
    '* * * * ' +
    ' * * * *' +
    '* * * * ' +
    ' * * * *' +
    '* * * * ' +
    ' * * * *'
    ,
    'gem0':
    '        ' +
    '   **   ' +
    '  * **  ' +
    ' * **** ' +
    ' ****** ' +
    ' ****** ' +
    '  ****  ' +
    '        '
    ,
    'gem1':
    '        ' +
    '        ' +
    '   **   ' +
    '  * **  ' +
    ' * **** ' +
    ' ****** ' +
    '  ****  ' +
    '        '
    ,
    'key':
    '        ' +
    '   **   ' +
    '   **   ' +
    ' ****** ' +
    ' ****** ' +
    '   **   ' +
    '   **   ' +
    '        '
    ,
    'lock':
    '********' +
    '***  ***' +
    '***  ***' +
    '*      *' +
    '*      *' +
    '***  ***' +
    '***  ***' +
    '********'
    ,
    'up':
    '       *' +
    '      **' +
    '     ***' +
    '    ****' +
    '   *****' +
    '  ******' +
    ' *******' +
    '********'
    ,
    'down':
    '*       ' +
    '**      ' +
    '***     ' +
    '****    ' +
    '*****   ' +
    '******  ' +
    '******* ' +
    '********'
    ,
    'fire0':
    '*   * * ' +
    '  *   * ' +
    '*   *   ' +
    '* * * * ' +
    '* *   * ' +
    '* * * * ' +
    '* * * * ' +
    '* * * * '
    ,
    'fire1':
    '* *     ' +
    '*   *   ' +
    '  * * * ' +
    '* *     ' +
    '* * * * ' +
    '* *   * ' +
    '* * * * ' +
    '* * * * '
    ,
    'rubble':
    '        ' +
    '        ' +
    '  *  *  ' +
    '        ' +
    '        ' +
    '  *  *  ' +
    '        ' +
    '        '
    ,
    'heart':
    '        ' +
    '  ** ** ' +
    ' *******' +
    ' *******' +
    '  ***** ' +
    '   ***  ' +
    '    *   ' +
    '        '
}

// MAP
let mapWidth = 16
let mapHeight = 8
let maps = []
let currentMapIndex = 0
let colors = ['#f6f', '#ff6', '#6ff']

// CANVAS
let canvas, context

// STATE
let lastTimestamp
let lastKey
let keyIsDown = false
let isSelectingTile = false
let isPlacingTile = false
let selectedTile = 0
let showWinScreen = false

// ANIMATIONS
let lastFrameTime = 0
let currentFrame = 0

// TRANSITIONS
let transitionMax = 1000
let transitionTimer = transitionMax
let transitionType = 'start'

let randomTile = () => {
    let tileIndex = Math.floor(Math.random() * (tileTypes.length - 2)) + 2
    return tileIndex
}

let countGems = () => {
    let gemCount = 0
    for (let mapIndex = 0; mapIndex < maps.length; mapIndex++) {
        let map = maps[mapIndex]
        for (let tileX = 0; tileX < mapWidth; tileX++) {
            for (let tileY = 0; tileY < mapHeight; tileY++) {
                let tileIndex = mapWidth * tileY + tileX
                let tileTypeIndex = map[tileIndex]
                let tileType = tileTypes[tileTypeIndex]
                if (tileType === 'gem') {
                    gemCount += 1
                }
            }
        }
    }
    return gemCount
}

let drawMap = (mapIndex) => {
    let map = maps[mapIndex]
    for (let x = 0; x < mapWidth; x++) {
        for (let y = 0; y < mapHeight; y++) {
            let tileIndex = mapWidth * y + x
            let tileTypeIndex = map[tileIndex]
            let tileType = tileTypes[tileTypeIndex]

            if (removedItems[mapIndex].includes(tileIndex)) {
                tileType = 'rubble'
            }

            if (movedEarth[mapIndex].includes(tileIndex)) {
                tileType = 'earth'
            }

            if (tiles[tileType + currentFrame]) {
                if (mapIndex === currentMapIndex) {
                    tileType += currentFrame
                }
                else {
                    tileType += 0
                }
            }

            if (mapIndex === currentMapIndex) {
                context.globalAlpha = 0.1
                drawTile(tiles[tileType], x * tileWidth + 1, y * tileHeight + 1)
                context.globalAlpha = 1
            }

            drawTile(tiles[tileType], x * tileWidth, y * tileHeight)

        }
    }
}

let drawTile = (tile, tx, ty) => {
    for (let x = 0; x < tileWidth; x++) {
        for (let y = 0; y < tileHeight; y++) {
            if (tile[tileWidth * y + x] === '*') {
                context.fillRect(tx + x, ty + y, 1, 1)
            }
        }
    }
}

let createMap = (isRandomized, hasStart) => {
    let map = []
    for (let i = 0; i < mapWidth * mapHeight; i++) {
        let tileIndex = 0
        if (isRandomized && Math.random() < 0.1) tileIndex = randomTile()
        map.push(tileIndex)
    }
    if (hasStart) {
        let startPos = Math.floor(Math.random() * mapWidth * mapHeight)
        map[startPos] = 1
    }
    return map
}

let mapToBits = (map) => {
    let bits = ''
    while (map.length > 0) {
        let char = map[0]
        let count = 1
        map = map.slice(1)
        while (map[0] === char && count < 16) {
            count++
            map = map.slice(1)
        }

        let charBits = char.toString(2)
        while (charBits.length < 4) {
            charBits = '0' + charBits
        }

        let countBits = (count - 1).toString(2)
        while (countBits.length < 4) {
            countBits = '0' + countBits
        }

        bits += charBits + countBits
    }
    return bits
}

let bitsToMap = (bits) => {
    let map = []
    while (bits.length > 0) {
        let charBits = bits.slice(0, 4)
        let countBits = bits.slice(4, 8)

        let char = parseInt(charBits, 2)
        let count = parseInt(countBits, 2) + 1

        for (let i = 0; i < count; i++) {
            map.push(char)
        }

        bits = bits.slice(8)
    }
    return map
}

let encodeMap = (map) => {
    let bits = 1 + mapToBits(map) // add one at beginning to avoid losing leading 0's
    let num = bigInt(bits, 2)
    let data = num.toString(62, base62charset)
    return data
}

let decodeMap = (data) => {
    let num = bigInt(data, 62, base62charset, true)
    let bits = num.toString(2).slice(1) // remove the leading 1 we added during encoding
    let map = bitsToMap(bits)
    return map
}

let updateAvatar = (dt) => {
    if (!keyIsDown) return
    else keyIsDown = false

    let posX = avatarPosX
    let posY = avatarPosY

    // get movements
    if (lastKey === 'ArrowLeft' || lastKey === 'a') {
        posX -= 1
    }
    else if (lastKey === 'ArrowRight' || lastKey === 'd') {
        posX += 1
    }
    else if (lastKey === 'ArrowUp' || lastKey === 'w') {
        posY -= 1
    }
    else if (lastKey === 'ArrowDown' || lastKey === 's') {
        posY += 1
    }

    // check edges
    let worldLeft = 0
    let worldRight = mapWidth
    let worldTop = 0
    let worldBottom = mapHeight
    if (posX < worldLeft) {
        posX = worldLeft
    }
    if (posX + 1 > worldRight) {
        posX = worldRight - 1
    }
    if (posY < worldTop) {
        posY = worldTop
    }
    if (posY + 1 > worldBottom) {
        posY = worldBottom - 1
    }

    let map = maps[currentMapIndex]
    let tileIndex = mapWidth * posY + posX
    let tileTypeIndex = map[tileIndex]
    let tileType = tileTypes[tileTypeIndex]
    let tileIsTemp = false
    if (removedItems[currentMapIndex].includes(tileIndex)) {
        tileType = 'empty'
    }
    if (movedEarth[currentMapIndex].includes(tileIndex)) {
        tileType = 'earth'
        tileIsTemp = true
    }

    let blockAvatar = false

    if (tileType === 'block') {
        blockAvatar = true
    }
    else if (tileType === 'start') {
        if (numGems >= countGems()) {
            showWinScreen = true
            transitionType = 'win'
            transitionTimer = transitionMax
        }
    }
    else if (tileType === 'gem') {
        removedItems[currentMapIndex].push(tileIndex)
        numGems += 1
    }
    else if (tileType === 'key') {
        removedItems[currentMapIndex].push(tileIndex)
        numKeys += 1
    }
    else if (tileType === 'lock') {
        if (numKeys > 0) {
            removedItems[currentMapIndex].push(tileIndex)
            numKeys -= 1
        }
        blockAvatar = true
    }
    else if (tileType === 'up') {
        currentMapIndex += 1
        if (currentMapIndex >= maps.length) currentMapIndex = 0
        if (maps[currentMapIndex][tileIndex] > 0) maps[currentMapIndex][tileIndex] = 0
        transitionType = 'up'
        transitionTimer = transitionMax
    }
    else if (tileType === 'down') {
        currentMapIndex -= 1
        if (currentMapIndex < 0) currentMapIndex = maps.length - 1
        if (maps[currentMapIndex][tileIndex] > 0) maps[currentMapIndex][tileIndex] = 0
        transitionType = 'down'
        transitionTimer = transitionMax
    }
    else if (tileType === 'earth') {
        // push earth in direction of movement
        let x = posX
        let y = posY

        if (lastKey === 'ArrowLeft' || lastKey === 'a') x--
        else if (lastKey === 'ArrowRight' || lastKey === 'd') x++
        else if (lastKey === 'ArrowUp' || lastKey === 'w') y--
        else if (lastKey === 'ArrowDown' || lastKey === 's') y++

        let newIndex = mapWidth * y + x
        let tileTypeIndexAtLocation = maps[currentMapIndex][newIndex]
        let tileTypeAtLocation = tileTypes[tileTypeIndexAtLocation]
        let tileAtLocationIsTemp = false
        if (movedEarth[currentMapIndex].includes(newIndex)) {
            tileTypeAtLocation = 'earth'
            tileAtLocationIsTemp = true
        }

        let locationIsBlocked =
            tileTypeAtLocation !== 'empty' &&
            !removedItems[currentMapIndex].includes(newIndex)

        if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) {
            blockAvatar = true
        }
        else if (locationIsBlocked) {
            if (tileTypeAtLocation === 'fire') {
                if (tileAtLocationIsTemp) {
                    movedEarth[currentMapIndex] = movedEarth[currentMapIndex].filter(i => i !== newIndex)
                } else {
                    removedItems[currentMapIndex].push(newIndex)
                }
                if (tileIsTemp) {
                    movedEarth[currentMapIndex] = movedEarth[currentMapIndex].filter(i => i !== tileIndex)
                } else {
                    removedItems[currentMapIndex].push(tileIndex)
                }
            }
            else {
                blockAvatar = true
            }
        }
        else {
            if (tileIsTemp) {
                movedEarth[currentMapIndex] = movedEarth[currentMapIndex].filter(i => i !== tileIndex)
            } else {
                removedItems[currentMapIndex].push(tileIndex)
            }
            movedEarth[currentMapIndex].push(newIndex)
        }
    }
    else if (tileType === 'fire') {
        sendAvatarToStart()
        return
    }

    if (blockAvatar) {
        return
    }

    avatarPosX = posX
    avatarPosY = posY
}

let sendAvatarToStart = () => {
    // find start location
    let startMapIndex = 0
    let startX = 0
    let startY = 0
    for (let mapIndex = 0; mapIndex < maps.length; mapIndex++) {
        let map = maps[mapIndex]
        for (let tileX = 0; tileX < mapWidth; tileX++) {
            for (let tileY = 0; tileY < mapHeight; tileY++) {
                let tileIndex = mapWidth * tileY + tileX
                let tileTypeIndex = map[tileIndex]
                let tileType = tileTypes[tileTypeIndex]
                if (tileType === 'start') {
                    startMapIndex = mapIndex
                    startX = tileX
                    startY = tileY
                }
            }
        }
    }

    // set current map to the one start is on
    currentMapIndex = startMapIndex

    // set avatar pos to start pos
    avatarPosX = startX
    avatarPosY = startY

    // reset collectables
    numKeys = 0
    numGems = 0
    removedItems = [[], [], []]
    movedEarth = [[], [], []]

    // start transition
    transitionType = 'start'
    transitionTimer = transitionMax
}

let updateWinScreen = () => {
    // draw background
    context.fillStyle = '#222'
    context.fillRect(0, 0, mapWidth * tileWidth, mapHeight * tileHeight)

    // draw win message
    context.fillStyle = '#eee'
    let centerX = (mapWidth * tileWidth / 2) - (tileWidth / 2)
    let centerY = (mapHeight * tileHeight / 2) - (tileHeight / 2)
    drawTile(tiles['heart'], centerX - tileWidth - 2, centerY)
    drawTile(tiles['gem' + currentFrame], centerX, centerY)
    drawTile(tiles['heart'], centerX + tileWidth + 2, centerY)
}

let updateTransition = (dt) => {
    transitionTimer -= dt
    let progress = 1 - transitionTimer / transitionMax
    
    let width = mapWidth * tileWidth
    let height = mapHeight * tileHeight

    let left = 0
    let right = width
    let top = 0
    let bottom = height

    if (transitionType === 'start') {
        context.fillStyle = '#222'
        if (progress > 0.5) {
            context.globalAlpha = Math.max(0, 1 - (progress - 0.5) * 2)
        }
        context.fillRect(0, 0, width, height)
        
        context.fillStyle = '#eee'
        drawTile(tiles['avatar0'], avatarPosX * tileWidth, avatarPosY * tileHeight)
    
        context.globalAlpha = 1
    }
    else if (transitionType === 'win') {
        context.globalAlpha = progress
        updateWinScreen()
        context.globalAlpha = 1
    }
    else if (transitionType === 'up' || transitionType === 'down') {
        context.fillStyle = colors[currentMapIndex]
        context.globalCompositeOperation = 'multiply'
        if (progress > 0.5) {
            context.globalAlpha = Math.max(0, 1 - (progress - 0.5) * 2)
        }
        context.fillRect(0, 0, width, height)

        context.globalAlpha = 1 - progress
        context.fillStyle = '#222'
        if (progress > 0.1) {
            if (transitionType === 'up') {
                bottom = height - (progress - 0.1) * 2 * height
            }
            if (transitionType === 'down') {
                top = (progress - 0.1) * 2 * height
            }
        }
        context.fillRect(left, top, right - left, bottom - top)

        context.globalCompositeOperation = 'source-over'
        context.globalAlpha = 1
        context.fillStyle = '#fff'
        let lineY = (transitionType === 'up') ? height - bottom : bottom - top
        context.fillRect(0, lineY, width, 2)
    }
}

let updateTileSelection = () => {
    // draw background
    context.fillStyle = '#eee'
    context.globalAlpha = 0.8
    context.fillRect(0, 0, mapWidth * tileWidth, mapHeight * tileHeight)
    context.fillStyle = '#222'
    context.globalAlpha = 0.1
    context.fillRect(tileWidth + 2, tileHeight + 2, (mapWidth - 2) * tileWidth, (mapHeight - 2) * tileHeight)
    context.globalAlpha = 1
    context.fillRect(tileWidth, tileHeight, (mapWidth - 2) * tileWidth, (mapHeight - 2) * tileHeight)

    // draw tiles 
    for (let tileTypeIndex = 0; tileTypeIndex < tileTypes.length; tileTypeIndex++) {
        let x = (tileWidth * 2 - 1) + tileTypeIndex * (tileWidth + 2)
        let y = mapHeight * tileHeight / 2 - (tileHeight / 2)

        let tileType = tileTypes[tileTypeIndex]
        if (tileType === 'empty') {
            tileType = 'rubble'
        }
        if (tiles[tileType + 0]) {
            tileType += 0
        }
        if (tileTypeIndex === selectedTile) {
            context.fillStyle = colors[currentMapIndex]
            context.fillRect(x - 1, y - 1, tileWidth + 2, tileHeight + 2)
        }
        context.fillStyle = '#eee'
        drawTile(tiles[tileType], x, y)
    }
}

let update = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp
    let dt = timestamp - lastTimestamp
    lastTimestamp = timestamp

    // animation frame
    if (!isSelectingTile) {
        lastFrameTime += dt
    }
    if (lastFrameTime > 300) {
        lastFrameTime = 0
        currentFrame = currentFrame === 0 ? 1 : 0
    }

    // clear screen
    context.clearRect(0, 0, mapWidth * tileWidth, mapHeight * tileHeight)

    // draw background
    context.fillStyle = '#eee'
    context.fillRect(0, 0, mapWidth * tileWidth, mapHeight * tileHeight)

    // draw maps
    for (let i = maps.length - 1; i >= 0; i--) {
        if (currentMapIndex === i) continue
        context.globalCompositeOperation = 'multiply'
        context.fillStyle =  colors[i]
        drawMap(i)
    }
    context.globalCompositeOperation = 'source-over'
    context.fillStyle = '#444'
    drawMap(currentMapIndex)

    // update and draw avatar
    if (transitionTimer <= 0 && !showWinScreen) updateAvatar(dt)
    if (!isPlacingTile) {
        context.fillStyle = '#444'
        context.globalAlpha = 0.1
        drawTile(tiles['avatar' + currentFrame], avatarPosX * tileWidth + 1, avatarPosY * tileHeight + 1)
        context.globalAlpha = 1
        drawTile(tiles['avatar' + currentFrame], avatarPosX * tileWidth, avatarPosY * tileHeight)
    }

    // update transition
    if (transitionTimer > 0) {
        updateTransition(dt)
    }

    // selecting tile
    if (isSelectingTile && transitionTimer <= 0) {
        updateTileSelection()
    }

    // placing tile
    if (isPlacingTile && transitionTimer <= 0) {
        context.fillStyle = colors[currentMapIndex]
        let tileType = tileTypes[selectedTile]
        if (tileType === 'empty') tileType = 'rubble'
        if (tiles[tileType + '0']) tileType += '0'
        let tile = tiles[tileType]
        drawTile(tile, avatarPosX * tileWidth, avatarPosY * tileHeight)
    }

    // show win screen
    if (showWinScreen && transitionTimer <= 0) {
        updateWinScreen()
    }

    // next frame
    window.requestAnimationFrame(update)
}

let gameLink

let updateGameLink = () => {
    let baseUrl = window.location.href.split('?')[0]
    let data = maps.map(m => encodeMap(m)).join('-')
    gameLink.href = baseUrl + '?g=' + data
}

window.onload = () => {
    let main = document.getElementById('main')

    // create canvas
    canvas = document.createElement('canvas')
    canvas.width = mapWidth * tileWidth
    canvas.height = mapHeight * tileHeight
    context = canvas.getContext('2d', { alpha: false })
    main.appendChild(canvas)

    // create link to this map
    gameLink = document.createElement('a')
    gameLink.innerText = 'share this world'
    gameLink.target = '_blank'
    main.appendChild(gameLink)

    // create instructions
    let instructions = document.createElement('div')
    instructions.id = 'instructions'
    instructions.innerHTML = `
    <strong>arrows:</strong> move<br>
    <strong>shift + arrows:</strong> pick tile<br>
    <strong>space + arrows:</strong> place tile<br>
    <strong>goal:</strong> return to start with all slimes<br>`
    main.appendChild(instructions)
    
    // get map from url
    let url = window.location.href
    let urlParts = url.split('?g=')
    if (urlParts.length > 1) {
        let data = urlParts[1]
        maps = data.split('-').map(m => decodeMap(m))
        gameLink.href = url
    } else {
        maps = [createMap(true, true), createMap(true), createMap(true)]
        updateGameLink()
    }

    // initialize avatar
    sendAvatarToStart()

    // setup event handlers
    document.addEventListener('keydown', e => {
        if (showWinScreen && transitionTimer <= 0) {
            showWinScreen = false
            sendAvatarToStart()
            return
        }

        if (e.key === 'z' || e.key === 'Shift') {
            isSelectingTile = true
        }
        else if (isSelectingTile) {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                selectedTile -= 1
                if (selectedTile < 0) {
                    selectedTile = tileTypes.length - 1
                }
            }
            else if (e.key === 'ArrowRight' || e.key === 's') {
                selectedTile += 1
                if (selectedTile >= tileTypes.length) {
                    selectedTile = 0
                }
            }
        }
        else if (e.key === 'x' || e.key === ' ') {
            isPlacingTile = true
        }
        else if (isPlacingTile) {
            let x = avatarPosX
            let y = avatarPosY

            if (e.key === 'ArrowLeft' || e.key === 'a') x--
            else if (e.key === 'ArrowRight' || e.key === 'd') x++
            else if (e.key === 'ArrowUp' || e.key === 'w') y--
            else if (e.key === 'ArrowDown' || e.key === 's') y++
            else return

            if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
                return
            }

            let tileIndex = mapWidth * y + x
            maps[currentMapIndex][tileIndex] = selectedTile
            removedItems[currentMapIndex] = removedItems[currentMapIndex].filter(i => i !== tileIndex)
            movedEarth[currentMapIndex] = movedEarth[currentMapIndex].filter(i => i !== tileIndex)
            updateGameLink()
            
            isPlacingTile = false
        }
        else {
            keyIsDown = true
            lastKey = e.key
        }
    })

    document.addEventListener('keyup', e => {
        if (isSelectingTile && (e.key === 'z' || e.key === 'Shift')) {
            isSelectingTile = false
        }
        else if (isPlacingTile && (e.key === 'x' || e.key === ' ')) {
            isPlacingTile = false
        }
        else if (e.key === lastKey) {
            keyIsDown = false
        }
    })
    
    // start animation
    window.requestAnimationFrame(update)
}