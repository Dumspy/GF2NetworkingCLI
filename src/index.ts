#!usr/bin/env node
import inquirer from 'inquirer';

const binary = [128, 64, 32, 16, 8, 4, 2, 1];
const defaultSubnetMasks = [[255, 0, 0, 0], [255, 255, 0, 0], [255, 255, 255, 0]]
const ipClassLetters = ['A', 'B', 'C', 'D', 'E']

function getIpClass(ip: number[]) {
    if (ip[0] >= 1 && ip[0] <= 127) {
        return 0 // A
    } else if (ip[0] >= 128 && ip[0] <= 191) {
        return 1 // B
    } else if (ip[0] >= 192 && ip[0] <= 223) {
        return 2 // C
    } else if (ip[0] >= 224 && ip[0] <= 239) {
        return 3 // D
    } else if (ip[0] >= 240 && ip[0] <= 255) {
        return 4 // E
    }

    console.log('Invalid IP address')
    process.exit(1)
}

async function promptIp(): Promise<number[]> {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'ip',
            message: 'Enter the IP address to subnet'
        }
    ])
    return answer.ip.split('.').map(Number)
}

async function basedOf() {
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'basedOf',
            message: 'Based of what?',
            choices: ['Hosts', 'Subnets']
        }
    ])
    return answer.basedOf
}

async function promptRequiredSubnets() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'subnets',
            message: 'Enter the number of subnets required'
        }
    ])
    return answer.subnets
}

async function promptRequiredHosts() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'hosts',
            message: 'Enter the number of usable hosts required'
        }
    ])
    return answer.hosts
}

function getSubnetBits(subnets: number) {
    return Math.ceil(Math.log2(subnets))
}

function getSubnetBitsFromHosts(ipClassValue:number, hosts: number) {
    return (3-ipClassValue)*8 - Math.ceil(Math.log2(hosts))
}

function calculateMinSubnets(subnetBits: number) {
    return Math.pow(2, subnetBits)
}

function calculateSubnetMask(ipClassValue: number, borrowedBits: number) {
    let subnetMask = defaultSubnetMasks[ipClassValue]
    let currentOctet = 1 + ipClassValue
    while (borrowedBits > 0) {
        let bits = borrowedBits > 8 ? 8 : borrowedBits;
        let octetValue = 0;
        for (let index = 0; index < bits; index++) {
            octetValue += binary[index]

        }
        subnetMask[currentOctet] = octetValue
        currentOctet++
        borrowedBits -= 8;
    }
    return subnetMask
}

console.clear()


const ip = await promptIp()
console.log("Class: " + ipClassLetters[getIpClass(ip)])
console.log("Default Subnet Mask: " + defaultSubnetMasks[getIpClass(ip)].join('.'))

const basedOfValue = await basedOf()

let subnetBits = 0
switch(basedOfValue) {
    case 'Subnets':
        const requiredSubnets = await promptRequiredSubnets()
        subnetBits = getSubnetBits(requiredSubnets)
        break;
    case 'Hosts':
        let requiredHosts = await promptRequiredHosts()
        requiredHosts += 2
        subnetBits = getSubnetBitsFromHosts(getIpClass(ip), requiredHosts)
        break;
}

console.log("Bits borrowed for network: " + subnetBits)
console.log("Total number of subnets: " + calculateMinSubnets(subnetBits))

const totalHostAddreses = Math.pow(2, (3 - getIpClass(ip)) * 8 - subnetBits)
const usableHostAddresses = totalHostAddreses - 2
console.log("Total number of host addresse: " + totalHostAddreses)
console.log("Number of usable addresse: " + usableHostAddresses)

const subnetMask = calculateSubnetMask(getIpClass(ip), subnetBits)
if (subnetMask.length != 4) {
    console.log("Invalid subnet mask")
    process.exit(1)
}
console.log("Subnet Mask: " + calculateSubnetMask(getIpClass(ip), subnetBits).join('.'))