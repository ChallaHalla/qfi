import { ethers } from 'hardhat';
import { Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import deployGrantRound from "./helpers/DeployGrantRound";

chai.use(solidity);
const { expect } = chai;

describe('Grant Round Factory', () => {
  let deployer: Signer;
  let addr1: Signer;
  let grantRoundFactory: GrantRoundFactory;

  beforeEach(async () => {
    [deployer, addr1] = await ethers.getSigners();
    grantRoundFactory = await deployGrantRound(deployer)
  })

  it('verify - initializes properly', async () => {
    const deployTransaction = await grantRoundFactory.deployTransaction.wait()
    expect(deployTransaction.status).to.not.equal(0);
    expect(deployTransaction.contractAddress).to.equal(grantRoundFactory.address);
  })

  it('verify - configured properly', async () => {
    expect(await grantRoundFactory.messageAqFactory()).to.equal(ethers.constants.AddressZero)
    expect(await grantRoundFactory.recipientRegistry()).to.equal(ethers.constants.AddressZero)
  })

  describe('changing recipient registry', () => {
    it('verify - allows owner to set recipient registry', async () => { 
      const RecipientRegistryFactory = await ethers.getContractFactory("OptimisticRecipientRegistry")
      const recipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
      grantRoundFactory.setRecipientRegistry(recipientRegistry.address);
      const contractRecipientRegistry = await grantRoundFactory.recipientRegistry()
      expect(contractRecipientRegistry).to.equal(recipientRegistry.address)
    })

    it('require fail - allows only owner to set recipient registry', async () => {
      const RecipientRegistryFactory = await ethers.getContractFactory("OptimisticRecipientRegistry")
      const recipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
     expect(
        grantRoundFactory.connect(addr1).setRecipientRegistry(recipientRegistry.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    })

    it('verify - allows owner to change recipient registry', async () => {
      const RecipientRegistryFactory = await ethers.getContractFactory("OptimisticRecipientRegistry")
      let recipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
      grantRoundFactory.setRecipientRegistry(recipientRegistry.address);
      let contractRecipientRegistry = await grantRoundFactory.recipientRegistry()
      expect(contractRecipientRegistry).to.equal(recipientRegistry.address)

      recipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await addr1.getAddress());
      grantRoundFactory.setRecipientRegistry(recipientRegistry.address);
      contractRecipientRegistry = await grantRoundFactory.recipientRegistry()
      expect(contractRecipientRegistry).to.equal(recipientRegistry.address)
    })
  })

  
})
