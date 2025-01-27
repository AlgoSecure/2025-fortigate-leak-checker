const ipv4CidrRegex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}(\/(3[0-2]|[1-2]\d))?$/
const translations = {
    "en": {
        "checkResults": "Check results:",
        "matchFound": "Configuration leak",
        "leakOn": "Leak on",
        "noMatchFound": "No configuration leak",
        "invalidFormat": "Format not recognized",
        "checkOtherAssets": "Check other assets",
    },
    "fr": {
        "checkResults": "Résultats :",
        "matchFound": "Fuite de configuration",
        "leakOn": "Fuite sur",
        "noMatchFound": "Aucune fuite de configuration",
        "invalidFormat": "Format non reconnu",
        "checkOtherAssets": "Vérifier d'autres actifs",
    },
}[lang]

var affectedIPs = ""

// Lookup on IP addresses or CIDR entered in textarea input
function ipsLookup() {
    const results = []
    
    const inputValue = document.getElementById('input').value
    if (!inputValue) {
        return
    }

    const inputIPs = inputValue.split('\n')
    for (let inputIP of inputIPs) {
        inputIP = inputIP.trim()
        if (!inputIP) {
            continue
        }

        const result = { ipAddress: inputIP, valid: true, matchs: [] }
        results.push(result)

        try {
            if (!ipv4CidrRegex.test(inputIP)) {
                result.valid = false
                continue
            }

            let ipAddressesToTest = [];

            const [ipAddress, prefix] = inputIP.split('/')

            if (prefix) {
                ipAddressesToTest = expandCIDR(ipAddress, prefix)
            } else {
                ipAddressesToTest = [ipAddress]
            }

            ipAddressesToTest.forEach(ip => {
                const affectedPort = getPortOfAffectedIP(ip)
                if (affectedPort) {
                    result.matchs.push({ ipAddress: ip, port: affectedPort })
                }
            })
        } catch (error) {
            result.valid = false
        }
    }

    const formEl = document.querySelector('.form')
    formEl.innerHTML = `<strong>${translations['checkResults']}</strong><br/><br/>`

    for (const result of results) {
        const resultEl = document.createElement('div')
        resultEl.innerText = result.ipAddress
        resultEl.style.display = "flex"
        resultEl.style.alignItems = "center"
        resultEl.style.marginBottom = "10px"
        formEl.appendChild(resultEl)

        if (result.valid) {
            if (result.matchs.length > 0) {
                resultEl.innerHTML = `<img src="./assets/icon-alert.svg">&nbsp;&nbsp;` + resultEl.innerHTML + " - " +  translations['matchFound']
                resultEl.style.color = "#e04b4b"
                resultEl.style.fontWeight = "bold"

                for (const match of result.matchs) {
                    const matchEl = document.createElement('div')
                    matchEl.innerText = `${match.ipAddress} (port ${match.port})`
                    matchEl.innerHTML = `&bull;&nbsp;${translations["leakOn"]} ` + matchEl.innerHTML
                    matchEl.style.color = "#e04b4b"
                    matchEl.style.marginBottom = "10px"
                    matchEl.style.marginLeft = "30px"
                    formEl.innerHTML += matchEl.outerHTML
                }
            } else {
                resultEl.innerHTML = `<img src="./assets/icon-check.svg">&nbsp;&nbsp;` + resultEl.innerHTML + " - " + translations['noMatchFound']
                resultEl.style.color = "#6ba725"
            }
        } else {
            resultEl.innerHTML = `<img src="./assets/icon-question.svg">&nbsp;&nbsp;` + resultEl.innerHTML + " - " + translations['invalidFormat']
            resultEl.style.color = "#7e7e7e"
        }
    }

    formEl.innerHTML += `<br/><div><small><a href="javascript:window.location.reload()">${translations['checkOtherAssets']}</a></small></div>`
}

// Convert IP address to int
const ipToInt = (ipAddress) => {
    return ipAddress.split(".").reduce((acc, byte) => (acc << 8) + parseInt(byte, 10), 0)
};

// Convert int to IP address
const intToIP = (int) => {
    return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255,
    ].join(".");
};

// Expand CIDR to list of IP address
function expandCIDR(ipAddress, prefix) {
    const subnetMaskBits = parseInt(prefix, 10);

    if (subnetMaskBits < 0 || subnetMaskBits > 32) {
        throw new Error("Invalid CIDR prefix");
    }

    const ipInt = ipToInt(ipAddress);
    const mask = (0xFFFFFFFF << (32 - subnetMaskBits)) >>> 0;
    const network = ipInt & mask;
    const broadcast = network | ~mask;

    const range = [];
    for (let i = network; i <= broadcast; i++) {
        range.push(intToIP(i));
    }

    const startIndex = range.indexOf(ipAddress);
    if (startIndex === -1) {
        throw new Error("IP address is not from computed range");
    }

    return range.slice(startIndex);
}

// Get port from affected IPs list if exists
function getPortOfAffectedIP(ipAddress) {
    const regex = new RegExp(`\r\n${ipAddress.replaceAll('.', '\\.')}:(\\d+)\r\n`, "g")
    const matches = [...affectedIPs.matchAll(regex)]
    if (matches.length === 0) {
        return null
    }

    return matches[0][1]
}

async function main() {
    affectedIPs = await (await fetch('./assets/affected_ips.txt')).text()
}

main()
