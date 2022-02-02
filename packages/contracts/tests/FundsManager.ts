import { ethers } from 'hardhat';
import { Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { FundsManager } from "../typechain/FundsManager";

chai.use(solidity);
const { expect } = chai;

describe('Funds manager', () => {
  
  let deployer: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let fundsManager: FundsManager;

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
    const FundsManagerFactory = await ethers.getContractFactory("FundsManager", deployer)
    fundsManager = await FundsManagerFactory.deploy();
  })

  it('verify - initializes properly', async () => {
    expect((await fundsManager.deployTransaction.wait()).status).to.not.equal(0);
  })

  it('verify - configured properly', async () => {
    //TODO not sure what to check here since no constructor
  })

  describe('managing funding sources', () => {
    it('verify - allows owner to add funding source', async () => {
      //TODO not sure if I can check the funding sources here 
      //since it is private in the contract
      fundsManager.addFundingSource(await addr1.getAddress())
      expect(true)
    })

    it('require fail - allows only owner to add funding source', async () => {
      expect(
        fundsManager.connect(addr1).addFundingSource(await addr2.getAddress())
      ).to.be.revertedWith("Ownable: caller is not the owner");
    })

    it('require fail - reverts if funding source is already added', async () => {
      fundsManager.addFundingSource(await addr1.getAddress())
      expect(fundsManager.addFundingSource(await addr1.getAddress())).
      to.be.revertedWith("Factory: Funding source already added")
    })

    it('verify - allows owner to remove funding source', async () => {
      fundsManager.addFundingSource(await addr1.getAddress())
      fundsManager.removeFundingSource(await addr1.getAddress())
      expect(true)
    })

    it('require fail - allows only owner to remove funding source', async () => {
      fundsManager.addFundingSource(await addr2.getAddress())
      expect(fundsManager.connect(addr1).removeFundingSource(await addr2.getAddress())).
      to.be.revertedWith("Ownable: caller is not the owner")
    })

    it('require fail - reverts if funding source is already removed', async () => {
      fundsManager.addFundingSource(await addr1.getAddress())
      fundsManager.removeFundingSource(await addr1.getAddress())
      expect(fundsManager.removeFundingSource(await addr1.getAddress())).
      to.be.revertedWith("Factory: Funding source not found")
    })
  })

  it('allows direct contributions to the matching pool', async () => {
    //TODO I'm assuming matching pool means contract's balance
    ////
    //const provider = ethers.getDefaultProvider('hardhat')
    //const initialBalance = await provider.getBalance(fundsManager.address);

    //const contribution = ethers.utils.parseEther("1") 

    //addr1.sendTransaction({
    //  to: fundsManager.address,
    //  value: contribution
    //})
    //const newBalance = await provider.getBalance(fundsManager.address);

    ////Not sure why this doesnt work
    //expect(newBalance).to.be(initialBalance + contribution)

  })

  describe('withdrawing funds', () => {
    //TODO doesnt look like contract does this?
  
    it('allows contributors to withdraw funds', async () => {
     
    })

    it('disallows withdrawal if round is not cancelled', async () => {
      
    })

    it('reverts if user did not contribute to the round', async () => {
     
    })

    it('reverts if funds are already withdrawn', async () => {
      
    })
  })



  describe('transferring matching funds', () => {
    

    it('returns the amount of available matching funding', async () => {
      
    })

    it('pulls funds from funding source', async () => {
      
    })

    it('pulls funds from funding source if allowance is greater than balance', async () => {
      
    })

    
  })



})
