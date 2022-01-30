import { ethers } from 'hardhat';
import { Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";


chai.use(solidity);
const { expect } = chai;

describe('Grant Round Factory', () => {
  let deployer: Signer;
  let addr1: Signer;
  let grantRoundFactory: GrantRoundFactory;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
    const PoseidonT3Factory =await  ethers.getContractFactory("PoseidonT3", deployer)
    const PoseidonT4Factory = await ethers.getContractFactory("PoseidonT4", deployer)
    const PoseidonT5Factory = await ethers.getContractFactory("PoseidonT5", deployer)
    const PoseidonT6Factory = await ethers.getContractFactory("PoseidonT6", deployer)

    const poseidonT3 = await PoseidonT3Factory.deploy();
    const poseidonT4 = await PoseidonT4Factory.deploy();
    const poseidonT5 = await PoseidonT5Factory.deploy();
    const poseidonT6 = await PoseidonT6Factory.deploy();

    const linkedLibraryAddresses = {
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]: poseidonT5.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]: poseidonT3.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]: poseidonT6.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]: poseidonT4.address,
    }
    const GrantRoundFactory = await ethers.getContractFactory( "GrantRoundFactory", {
      signer: deployer,
      libraries: { ...linkedLibraryAddresses }
    })
    grantRoundFactory = await GrantRoundFactory.deploy();

  })

  it('verify - initializes properly', async () => {
    await expect((await grantRoundFactory.deployTransaction.wait()).status).to.not.equal(0);
  })

  it('verify - configured properly', async () => {
    //TODO not sure what to do here since contract has nothing in constructor?
  })

  describe('changing recipient registry', () => {
    it('verify - allows owner to set recipient registry', async () => { 
      const RecipientRegistryFactory = await ethers.getContractFactory("OptimisticRecipientRegistry")
      const optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
      grantRoundFactory.setRecipientRegistry(optimisticRecipientRegistry.address);
      const rec = await grantRoundFactory.recipientRegistry()
      expect(rec).to.equal(optimisticRecipientRegistry.address)
    })

    it('require fail - allows only owner to set recipient registry', async () => {
      
    })

    it('varify - allows owner to change recipient registry', async () => {
    })
  })

  
})
