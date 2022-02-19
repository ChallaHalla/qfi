import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { OptimisticRecipientRegistry__factory } from "../typechain/factories/OptimisticRecipientRegistry__factory";
import { BaseERC20Token__factory } from "../typechain/factories/BaseERC20Token__factory";
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import { QFI } from "../typechain/QFI";
import { QFI__factory, QFILibraryAddresses } from "../typechain/factories/QFI__factory";
import { PoseidonT3 } from "../typechain/PoseidonT3";
import { PoseidonT3__factory } from "../typechain/factories/PoseidonT3__factory";
import { PoseidonT4 } from "../typechain/PoseidonT4";
import { PoseidonT4__factory } from "../typechain/factories/PoseidonT4__factory";
import { PoseidonT5 } from "../typechain/PoseidonT5";
import { PoseidonT5__factory } from "../typechain/factories/PoseidonT5__factory";
import { PoseidonT6 } from "../typechain/PoseidonT6";
import { PoseidonT6__factory } from "../typechain/factories/PoseidonT6__factory";
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import { PollFactory__factory, PollFactoryLibraryAddresses } from "../typechain/factories/PollFactory__factory";
import { FreeForAllGatekeeper__factory } from "../typechain/factories/FreeForAllGatekeeper__factory";
import { ConstantInitialVoiceCreditProxy__factory } from "../typechain/factories/ConstantInitialVoiceCreditProxy__factory";

chai.use(solidity);
const { expect } = chai;


describe.only('QFI', () => {
  
  let deployer: Signer;
  let RecipientRegistryFactory: OptimisticRecipientRegistry__factory;
  let BaseERC20TokenFactory: BaseERC20Token__factory;
  let baseERC20Token: BaseERC20Token;
  let qfi: QFI;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
    const PoseidonT3Factory = new PoseidonT3__factory(deployer);
    const PoseidonT4Factory = new PoseidonT4__factory(deployer);
    const PoseidonT5Factory = new PoseidonT5__factory(deployer);
    const PoseidonT6Factory = new PoseidonT6__factory(deployer);
    const poseidonT3 = await PoseidonT3Factory.deploy();
    const poseidonT4 = await PoseidonT4Factory.deploy();
    const poseidonT5 = await PoseidonT5Factory.deploy();
    const poseidonT6 = await PoseidonT6Factory.deploy();

    const linkedLibraryAddresses = {
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]: poseidonT5.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]: poseidonT3.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]: poseidonT6.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]: poseidonT4.address,
    };

    const GrantRoundFactory = await ethers.getContractFactory( "GrantRoundFactory", {
      signer: deployer,
      libraries: { ...linkedLibraryAddresses }
    }
    )

    BaseERC20TokenFactory = new BaseERC20Token__factory(deployer);
    baseERC20Token = await BaseERC20TokenFactory.deploy(100);
    RecipientRegistryFactory = new OptimisticRecipientRegistry__factory(deployer);
    const optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
    const grantRoundFactory = await GrantRoundFactory.deploy();
    grantRoundFactory.setRecipientRegistry(optimisticRecipientRegistry.address);
    const PollFactoryFactory = new PollFactory__factory({ ...linkedLibraryAddresses }, deployer);
    const pollFactory = await PollFactoryFactory.deploy();
    const FreeForAllGateKeeperFactory = new FreeForAllGatekeeper__factory(deployer);
    const freeForAllGateKeeper = await FreeForAllGateKeeperFactory.deploy();
    const ConstantInitialVoiceCreditProxyFactory = new ConstantInitialVoiceCreditProxy__factory(deployer);
    const constantInitialVoiceCreditProxy = await ConstantInitialVoiceCreditProxyFactory.deploy(0);

    const QFIFactory = new QFI__factory({ ...linkedLibraryAddresses }, deployer);

    qfi = await QFIFactory.deploy(
      baseERC20Token.address,
      grantRoundFactory.address,
      pollFactory.address,
      freeForAllGateKeeper.address,
      constantInitialVoiceCreditProxy.address
    )   
  })

  it('initializes', async () => {
    const deployTransaction = await qfi.deployTransaction.wait()
    expect(deployTransaction.status).to.not.equal(0);
    expect(deployTransaction.contractAddress).to.equal(qfi.address);
  })

  it('configured', async () => {
    expect(await qfi.grantRoundFactory()).to.not.equal(ethers.constants.AddressZero)
    expect(await qfi.currentStage()).to.equal(0);
    expect(await qfi.nativeToken()).to.not.equal(ethers.constants.AddressZero)
    expect(await qfi.voiceCreditFactor()).to.equal(10000000000000)
  })

  describe('changing signup gatekeeper', () => {
    it('allows owner to set signup gatekeeper', async () => {
      // signup gate keeper is only set during deploy?
      // so won't owner always be setting?
      // not sure how to test

    })

    it('allows only owner to set signup gatekeeper', async () => {
    })

    it('allows owner to change signup gatekeeper', async () => {
    })
  })

  

  describe('deploying funding round', () => {
    it('deploys funding round', async () => {
      
    })

    it('require fail - reverts if signup gatekeeper is not set', async () => {
      
    })

    it('require fail - reverts if recipient registry is not set', async () => {
      
    })

    it('require fail - reverts if native token is not set', async () => {
      
    })

    it('require fail - reverts if coordinator is not set', async () => {
      //Not sure how to do this because requires pub key struct
      
    })

    it('require fail - reverts if current round is not finalized', async () => {
      
    })

    it('require fail - verify - deploys new funding round after previous round has been finalized', async () => {
     
    })

    it('require fail - only owner can deploy funding round', async () => {
    })
  })

  describe('transferring matching funds', () => {

    it('returns the amount of available matching funding', async () => {
     
    })

    it('allows owner to finalize round', async () => {
      
    })

    it('does not allow funds to be sent without a tally', async () => {
      
    })

    it('pulls funds from funding source', async () => {
      
    })

    it('pulls funds from funding source if allowance is greater than balance', async () => {
      
    })

    it('allows only owner to finalize round', async () => {
      
    })

    it('reverts if round has not been deployed', async () => {
      
    })
  })

  // describe('cancelling round', () => {

  //   it('allows owner to cancel round', async () => {
      
  //   })

  //   it('allows only owner to cancel round', async () => {
     
  //   })

  //   it('reverts if round has not been deployed', async () => {
     
  //   })

  //   it('reverts if round is finalized', async () => {
      
  //   })
  // })

  // it('allows owner to set native token', async () => {
    
  // })

  // it('only owner can set native token', async () => {
    
  // })

})
