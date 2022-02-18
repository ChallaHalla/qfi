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

describe('Funds manager', () => {
  
  let deployer: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let fundsManager: FundsManager;
  let token: BaseERC20Token;
  let ERC20TokenFactory : BaseERC20Token__factory

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
    const FundsManagerFactory = await ethers.getContractFactory("FundsManager", deployer)

    fundsManager = await FundsManagerFactory.deploy();

    ERC20TokenFactory = await ethers.getContractFactory("BaseERC20Token", deployer)
    token = await ERC20TokenFactory.deploy(100);

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
    await token.transfer(await addr1.getAddress(), 50);
    await token.connect(addr1).transfer(fundsManager.address, 50);
    expect(await token.balanceOf(fundsManager.address)).to.equal(50)

  })

  //describe('withdrawing funds', () => {
  //  //TODO doesnt look like contract does this?
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
    //let grantRound
    //let grantRoundFactory

    //ERC20TokenFactory = await ethers.getContractFactory("BaseERC20Token", deployer)
    //token = await ERC20TokenFactory.deploy(100);

    //const PoseidonT3Factory =await  ethers.getContractFactory("PoseidonT3", deployer)
    //const PoseidonT4Factory = await ethers.getContractFactory("PoseidonT4", deployer) const PoseidonT5Factory = await ethers.getContractFactory("PoseidonT5", deployer)
    //const PoseidonT6Factory = await ethers.getContractFactory("PoseidonT6", deployer)

    //const poseidonT3 = await PoseidonT3Factory.deploy();
    //const poseidonT4 = await PoseidonT4Factory.deploy();
    //const poseidonT5 = await PoseidonT5Factory.deploy();
    //const poseidonT6 = await PoseidonT6Factory.deploy();

    //const linkedLibraryAddresses = {
    //  ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]: poseidonT5.address,
    //  ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]: poseidonT3.address,
    //  ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]: poseidonT6.address,
    //  ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]: poseidonT4.address,
    //}
    //const GrantRoundFactory = await ethers.getContractFactory( "GrantRoundFactory", {
    //  signer: deployer,
    //  libraries: { ...linkedLibraryAddresses }
    //})
    //grantRoundFactory = await GrantRoundFactory.deploy();
    //grantRound = grantRoundFactory.deployGrantRound(
    //        1,
    //        await addr1.getAddress(),
    //        token,
    //        100,
    //        _maxValues,
    //        _treeDepths,
    //        batchSizes,
    //        _coordinatorPubKey,
    //        vkRegistry,
    //        this,
    //        owner()
    //    );
    

    it('returns the amount of available matching funding', async () => {
      
    })

    it('pulls funds from funding source', async () => {
      
    })

    it('pulls funds from funding source if allowance is greater than balance', async () => {
      
    })

    
  })



})
