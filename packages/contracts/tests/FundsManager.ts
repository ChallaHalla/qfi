import { ethers, waffle} from 'hardhat'
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import { Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { FundsManager } from "../typechain/FundsManager";
import { GrantRound } from "../typechain/GrantRound";
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import getPoseidonLibraries from "./helpers/GetPoseidonLibraries"
import deployGrantRound from "./helpers/DeployGrantRound"
import { PubKey, PrivKey, Keypair } from "maci-domainobjs";



chai.use(solidity);
const { expect } = chai;

describe('Funds manager', () => {
  
  let deployer: Signer;
  let coordinator: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let fundsManager: FundsManager;
  let token: BaseERC20Token;
  let grantRound : GrantRound

  beforeEach(async () => {
    [deployer, coordinator, addr1, addr2] = await ethers.getSigners();
    const FundsManagerFactory = await ethers.getContractFactory("FundsManager", deployer)

    fundsManager = await FundsManagerFactory.deploy();

    const BaseERC20TokenFactory = await ethers.getContractFactory("BaseERC20Token", deployer)
    token = await BaseERC20TokenFactory.deploy(100);
    await expect((await token.deployTransaction.wait()).status).to.not.equal(0);
  })

  it('verify - initializes properly', async () => {
    expect((await fundsManager.deployTransaction.wait()).status).to.not.equal(0);
    fundsManager.address

  })

  it('verify - configured properly', async () => {
    expect(await ethers.provider.getCode(fundsManager.address)).to.not.equal("0x")
    const contract = await ethers.getContractAt("FundsManager", fundsManager.address)
  })

  describe('managing funding sources', () => {
    it('verify - allows owner to add funding source', async () => {
      const tx = await fundsManager.addFundingSource(await addr1.getAddress())
      expect((await tx.wait()).status).to.not.equal(0)
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

    // Test calling methods with bad inputs as well
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
    //NOTE I'm assuming matching pool means contract's balance
    const fundingSourceAddress = await addr2.getAddress()

    await fundsManager.addFundingSource(fundingSourceAddress)
    expect(await fundsManager.getMatchingFunds(token.address)).to.equal(0)

    await token.transfer(fundsManager.address, 10);
    expect(await fundsManager.getMatchingFunds(token.address)).to.equal(10)
    await token.transfer(fundingSourceAddress, 10);
    await token.connect(addr2).approve(fundsManager.address, 10)
    expect(await fundsManager.getMatchingFunds(token.address)).to.equal(20)
  })

  //describe('withdrawing funds', () => {
  //  //Seems like QFI contract handles withdrawls
  //
  //  it('allows contributors to withdraw funds', async () => {
  //   
  //  })

  //  it('disallows withdrawal if round is not cancelled', async () => {
  //    
  //  })

  //  it('reverts if user did not contribute to the round', async () => {
  //   
  //  })

  //  it('reverts if funds are already withdrawn', async () => {
  //    
  //  })
  //})



  describe('transferring matching funds', () => {
    let grantRound : any;
    beforeEach(async () => {
      grantRound = await deployGrantRound(deployer, token, coordinator)
    })
    

    
    it('returns the amount of available matching funding', async () => {
      const fundingSource1Address = await addr1.getAddress()
      const fundingSource2Address = await addr2.getAddress()
      await token.transfer(fundingSource1Address, 10);
      await token.transfer(fundingSource2Address, 25);

      await fundsManager.addFundingSource(fundingSource1Address)
      await fundsManager.addFundingSource(fundingSource2Address)
      await token.connect(addr1).approve(fundsManager.address, 10)
      await token.connect(addr2).approve(fundsManager.address, 25)
      expect(await fundsManager.getMatchingFunds(token.address)).to.equal(35)

      await token.transfer(fundsManager.address, 10);
      expect(await fundsManager.getMatchingFunds(token.address)).to.equal(45)
    })

    it('pulls funds from funding source', async () => {
      const fundingSource1Address = await addr1.getAddress()
      const fundingSource2Address = await addr2.getAddress()
      await token.transfer(fundingSource1Address, 10);
      await token.transfer(fundingSource2Address, 25);
      await fundsManager.addFundingSource(fundingSource1Address)
      await fundsManager.addFundingSource(fundingSource2Address)
      await token.connect(addr1).approve(fundsManager.address, 10)
      await token.connect(addr2).approve(fundsManager.address, 25)
      await token.transfer(fundsManager.address, 10);

      fundsManager.transferMatchingFunds(grantRound.address)
      expect(await token.balanceOf(grantRound.address)).to.equal(45)
    })

    it('pulls funds from funding source if allowance is greater than balance', async () => {
      const fundingSource1Address = await addr1.getAddress()
      const fundingSource2Address = await addr2.getAddress()
      await token.transfer(fundingSource1Address, 10);
      await token.transfer(fundingSource2Address, 25);
      await fundsManager.addFundingSource(fundingSource1Address)
      await fundsManager.addFundingSource(fundingSource2Address)
      await token.connect(addr1).approve(fundsManager.address, 100)
      await token.connect(addr2).approve(fundsManager.address, 100)
      fundsManager.transferMatchingFunds(grantRound.address)
      expect(await token.balanceOf(grantRound.address)).to.equal(35)

    })

    it('pulls only up to allowance from funding source if allowance is less than balance', async () => {
      const fundingSource1Address = await addr1.getAddress()
      const fundingSource2Address = await addr2.getAddress()
      await token.transfer(fundingSource1Address, 10);
      await token.transfer(fundingSource2Address, 25);
      await fundsManager.addFundingSource(fundingSource1Address)
      await fundsManager.addFundingSource(fundingSource2Address)
      await token.connect(addr1).approve(fundsManager.address, 10)
      await token.connect(addr2).approve(fundsManager.address, 10)
      await token.transfer(fundsManager.address, 10);

      fundsManager.transferMatchingFunds(grantRound.address)
      expect(await token.balanceOf(grantRound.address)).to.equal(30)
    })
    
  })



})
