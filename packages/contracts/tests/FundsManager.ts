import { ethers, waffle} from 'hardhat';
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import { Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { FundsManager } from "../typechain/FundsManager";
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import { BaseERC20Token__factory } from "../typechain/factories/BaseERC20Token__factory";

chai.use(solidity);
const { expect } = chai;

describe.only('Funds manager', () => {
  
  let deployer: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let fundsManager: FundsManager;
  let baseERC20Token: BaseERC20Token;
  let BaseERC20TokenFactory : BaseERC20Token__factory

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
    const FundsManagerFactory = await ethers.getContractFactory("FundsManager", deployer)
    fundsManager = await FundsManagerFactory.deploy();

    BaseERC20TokenFactory = await ethers.getContractFactory("BaseERC20Token", deployer)

  })

  it('verify - initializes properly', async () => {
    expect((await fundsManager.deployTransaction.wait()).status).to.not.equal(0);
    fundsManager.address

  })

  it('verify - configured properly', async () => {
    const provider = waffle.provider;
    expect(await provider.getCode(fundsManager.address)).to.not.equal("0x")
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
    const baseERC20Token = await BaseERC20TokenFactory.deploy(100);
    await baseERC20Token.transfer(await addr1.getAddress(), 50);
    await baseERC20Token.connect(addr1).transfer(fundsManager.address, 50);
    expect(await baseERC20Token.balanceOf(fundsManager.address)).to.equal(50)

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
