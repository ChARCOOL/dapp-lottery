import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Lottery deploying with address:', await deployer.getAddress())

  const Lottery = await ethers.getContractFactory('Lottery')
  const lottery = await Lottery.deploy()
  await lottery.deployed()

  console.log('Lottery deployed at address:', lottery.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
