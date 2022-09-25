#!usr/bin/env node
// import inquirer
import inquirer from 'inquirer';

const binary = [128, 64, 32, 16, 8, 4, 2, 1];
const defaultSubnetMask = [[255, 0, 0, 0], [255, 255, 0, 0], [255, 255, 255, 0]]

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
    return -1
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
            message: 'Enter the number of hosts required'
        }
    ])
    return answer.hosts
}

function getSubnetBits(subnets: number) {
    return Math.ceil(Math.log2(subnets))
} 2

function calculateMinSubnets(subnets: number) {
    return Math.pow(2, getSubnetBits(subnets))
}

const ip = await promptIp()
console.log(getIpClass(ip))
console.log(defaultSubnetMask[getIpClass(ip)])
const requiredSubnets = await promptRequiredSubnets()
const subnetBits = getSubnetBits(requiredSubnets)
console.log(calculateMinSubnets(requiredSubnets))


let subnetBitsLoop = subnetBits;
while (subnetBitsLoop > 0) {
    let bits = subnetBitsLoop > 8 ? 8 : subnetBitsLoop;
    let octetValue = 0;
    for (let index = 0; index < bits; index++) {
        octetValue += binary[index]

    }
    console.log(octetValue)
    subnetBitsLoop -= 8;
}
