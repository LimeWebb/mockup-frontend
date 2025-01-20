const apiLink = "https://limewebb.derpygamer2142.com/"

// ENDPOINTS TO USE
// /search (GET) -> For getting search results
// /sign-up (POST) -> For creating accounts
// /log-in (POST) -> For logging into accounts

const messages = {
    '404': 'Not Found.',
    '500': 'Something went wrong in our server. Sorry!'
}

const scenes = {
    main: document.getElementById('mainScene'),
    search: document.getElementById('searchScene')
}

if(Boolean(getSearchParam('search'))) {
    scenes['search'].classList.add('active')
    if(!navigator.onLine) {
        const holder = document.createElement('div')
        holder.className = 'errorDetails'

        const image = document.createElement('img')
        image.className = 'errorImage'

        const text = document.createElement('p')
        text.className = 'errorText'

        image.src = 'images/no_internet.png'
        image.alt = 'No Internet.'
        text.textContent = 'No Internet.'

        holder.appendChild(image)
        holder.appendChild(text)

        scenes['search'].appendChild(holder)
    } else {
        searchFor(getSearchParam('search'))
    }
} else {
    scenes['main'].classList.add('active')
}

function getSearchParam(param = '') {
    return new URL(window.location.href).searchParams.get(param)
}

function setCookie(name='', value='', daysToExpireIn=1) {
    const date = new Date()
    date.setTime(date.getTime() + (daysToExpireIn * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`
}

function deleteCookie(name='') {
    setCookie(name, null, 0)
}

function getCookie(name) {
    return document.cookie
        .split('; ')
        .find(cookie => cookie.startsWith(name + '='))
        ?.split('=')[1]
        ? decodeURIComponent(document.cookie.split('; ').find(cookie => cookie.startsWith(name + '='))?.split('=')[1])
        : null
}

function createResult(title='', description='', isNSFW=false) {
    const holder = document.createElement('div')
    const titleElem = document.createElement('p')
    titleElem.textContent = title
    titleElem.className = 'resultTitle'
    const descElem = document.createElement('p')
    descElem.textContent = description
    descElem.className = 'resultDescription'
    const image = document.createElement('img')
    image.className = 'resultWarning'
    holder.appendChild(titleElem)
    holder.appendChild(document.createElement('br'))
    holder.appendChild(descElem)
    if(isNSFW) {
        holder.appendChild(document.createElement('br'))
        image.src = 'images/marked_as_nsfw.png'
        image.alt = 'Marked as NSFW'
        holder.appendChild(image)
    }
    holder.className = 'searchResult'
    return holder
}

function createResultsFromJSON(json=[{space: '', owner: '', views: 0, isNSFW: 0}]) {
    json.forEach((space) => {
        scenes['search'].appendChild(document.createElement('br'))
        scenes['search'].appendChild(createResult(space.space, 'Very cool space', (space.isNSFW ?? 0) == 1))
    })
}

async function searchFor(search='') {
    try {
        const please_wait = document.createElement('p')
        please_wait.textContent = "Please wait.."
        please_wait.className = 'please_wait-text'
        scenes['search'].appendChild(please_wait)

        const result = await fetch(apiLink + 'search/' + encodeURIComponent(search))
        
        const holder = document.createElement('div')
        holder.className = 'errorDetails'

        const image = document.createElement('img')
        image.className = 'errorImage'

        const text = document.createElement('p')
        text.className = 'errorText'
        
        const errorCode = document.createElement('p')
        errorCode.className = 'errorCode'
        
        holder.appendChild(image)
        holder.appendChild(errorCode)
        holder.appendChild(text)
        
        switch(result.status) {
            case 404: 
                image.src = 'images/404.png'
                image.alt = messages[String(result.status)] ?? result.statusText
                text.textContent = messages[String(result.status)] ?? result.statusText
                errorCode.textContent = result.status
                
                scenes['search'].appendChild(holder)
                scenes['search'].removeChild(please_wait)
                return
            case 500: 
                image.src = 'images/500.png'
                image.alt = messages[String(result.status)] ?? result.statusText
                text.textContent = messages[String(result.status)] ?? result.statusText
                errorCode.textContent = result.status
                
                scenes['search'].appendChild(holder)
                scenes['search'].removeChild(please_wait)
                return
        }
        if (!result.ok) {
            throw new Error('Request not ok!')
        }
        const json = await result.json()
        if(json.length <= 0) {
            image.src = 'images/404.png'
            image.alt = messages['404']
            text.textContent = messages['404']
            errorCode.textContent = 404
            
            scenes['search'].appendChild(holder)
            scenes['search'].removeChild(please_wait)
            return
        }
        scenes['search'].removeChild(please_wait)
        createResultsFromJSON(json)
    } catch(err) {
        console.error(err)
    }
}