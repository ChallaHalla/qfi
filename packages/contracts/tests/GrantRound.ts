import { ethers } from 'hardhat';
import { Wallet, Signer } from "ethers";
import chai from 'chai';
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import { GrantRound } from "../typechain/GrantRound";
import { solidity } from 'ethereum-waffle';
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import deployGrantRound from "./helpers/DeployGrantRound"
import { PubKey, PrivKey, Keypair } from "maci-domainobjs";

chai.use(solidity);
const { expect } = chai;

describe.only('Grant Round', () => {
  
  let deployer: Signer;
  let coordinator: Signer;
  let addr1: Signer;
  let grantRound: GrantRound;
  let token: BaseERC20Token;
  let VKRegistry: any;

  beforeEach(async () => {
    [deployer, coordinator, addr1] = await ethers.getSigners();
    let baseERC20Token = await ethers.getContractFactory("BaseERC20Token", deployer)
    token = await baseERC20Token.deploy(100);

    grantRound = await deployGrantRound(deployer, token, coordinator)
  })

  it('initializes', async () => {
    const deployTransaction = await grantRound.deployTransaction.wait()
    expect(deployTransaction.status).to.not.equal(0);
    expect(deployTransaction.contractAddress).to.equal(grantRound.address);
  })

  it('configured', async () => {
    expect(await grantRound.voiceCreditFactor()).to.equal(1)
    expect(await grantRound.coordinator()).to.not.equal(ethers.constants.AddressZero)
    expect(await grantRound.nativeToken()).to.equal(token.address)
    expect(await grantRound.recipientRegistry()).to.not.equal(ethers.constants.AddressZero)
  })

  
  //describe('accepting contributions', () => {
  // 
  //  it('accepts contributions from everyone', async () => {
  //  })
  //
  //  it('rejects contributions if MACI has not been linked to a round', async () => {
  //  })
  //
  //  it('limits the number of contributors', async () => {
  //  })
  //
  //  it('rejects contributions if funding round has been finalized', async () => {
  //  })
  //
  //  it('rejects contributions with zero amount', async () => {
  //  })
  //
  //  it('rejects contributions that are too large', async () => {
  //  })
  //
  //  it('allows to contribute only once per round', async () => {
  //  })
  //
  //  it('requires approval to transfer', async () => {
  //  })
  //
  //  it('rejects contributions from unverified users', async () => {
  //  })
  //
  //  it('should not allow users who have not contributed to sign up directly in MACI', async () => {
  //  
  //  })
  //
  //  it('should not allow users who have already signed up to sign up directly in MACI', async () => {
  //   
  //  })
  //
  //  it('should not return the amount of voice credits for user who has not contributed', async () => {
  //  })
  //})
  
  //describe('voting', () => {
  //  
  //
  //  it('submits a vote', async () => {
  //   
  //  })
  //
  //  it('submits a key-changing message', async () => {
  //    
  //  })
  //
  //  it('submits an invalid vote', async () => {
  //   
  //  })
  //
  //  it('submits a vote for invalid vote option', async () => {
  //    
  //  })
  //
  //  it('submits a batch of messages', async () => {
  //  })
  //})
  //
  //describe('publishing tally hash', () => {
  //  it('allows coordinator to publish vote tally hash', async () => {
  //    
  //  })
  //
  //  it('allows only coordinator to publish tally hash', async () => {
  //    expect(grantRound.publishTallyHash("SDAD")).to.be.revertedWith("GrantRound: Sender is not the coordinator")
  //    
  //  })
  //
  //  it('reverts if round has been finalized', async () => {
  //    expect(grantRound.connect(coordinator).publishTallyHash("asdsad")).to.be.revertedWith("GrantRound: Round finalized")
  //  })
  //
  //  //it('rejects empty string', async () => {
  //  //  //expect(grantRound.connect(coordinator).publishTallyHash("")).to.be.revertedWith("GrantRound: Tally hash is empty string")
  //  //  
  //  //})
  //})
  
  //  describe('finalizing round', () => {
  //  
  //    it('allows owner to finalize round', async () => {
  //      await grantRound.finalize(0,0)
  //    })
  //  
  //    it('allows owner to finalize round when matching pool is empty', async () => {
  //      expect(grantRound.connect(addr1).finalize(0,0)).to.be.revertedWith("Ownable: caller is not the owner");
  //    })
  //  
  //    it('counts direct token transfers to funding round as matching pool contributions', async () => {
  //      
  //    })
  //  
  //    it('reverts if round has been finalized already', async () => {
  //      
  //    })

  //  
  //    it('reverts if voting is still in progress', async () => {
  //     
  //    })
  //  
  //    it('reverts if votes has not been tallied', async () => {
  //      
  //    })
  //  
  //    it('reverts if tally hash has not been published', async () => {
  //      
  //    })
  //  
  //    it('reverts if total votes is zero', async () => {
  //     
  //    })
  //  
  //    it('reverts if total amount of spent voice credits is incorrect', async () => {
  //      
  //    })
  //  
  //    it('allows only owner to finalize round', async () => {
  //    })
  //  })
  
     // describe('claiming funds', () => {
     // 
     //   it('allows recipient to claim allocated funds', async () => {
     //     
     //   })
     // 
     //   it('allows address different than recipient to claim allocated funds', async () => {
     //     
     //   })
     // 
     //   it('allows recipient to claim zero amount', async () => {
     //     
     //   })
     // 
     //   it('allows recipient to claim if the matching pool is empty', async () => {
     //     
     //   })
     // 
     //   it('should not allow recipient to claim funds if round has not been finalized', async () => {
     //    expect(grantRound.claimFunds(0, 1, [[0]], 0, 0, 0, 0, [[0]], 0)).to.be.revertedWith("GrantRound: Round not finalized");
     //   })
     // 
     //   it('should not allow recipient to claim funds if round has been cancelled', async () => {
     //    await grantRound.cancel()
     //    expect(grantRound.claimFunds(0, 1, [[0]], 0, 0, 0, 0, [[0]], 0)).to.be.revertedWith("GrantRound: Round has been cancelled");
     //   })
     // 
     //   it('sends funds allocated to unverified recipients back to matching pool', async () => {
     //     
     //   })
     // 
     //   it('allows recipient to claim allocated funds only once', async () => {
     //    
     //   })
     // 
     //   it('should verify that tally result is correct', async () => {
     //    
     //   })
     // 
     //   it('should verify that amount of spent voice credits is correct', async () => {
     //     
     //   })
     // })

  describe('cancelling round', () => {

    it('allows owner to cancel round', async () => {
      await grantRound.cancel()
      expect(await grantRound.isFinalized()).to.equal(true)
      expect(await grantRound.isCancelled()).to.equal(true)
    })

    it('allows only owner to cancel round', async () => {
      expect(grantRound.connect(addr1).cancel()).to.be.revertedWith("Ownable: caller is not the owner");
    })

    it('reverts if round has not been deployed', async () => {
      
    })

    it('reverts if round is finalized', async () => {
      //await grantRound.finalize(0,0)
      
    })
  })
  
});
