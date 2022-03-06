import { ethers, waffle} from 'hardhat';
import { Signer } from "ethers";
import { PoseidonT3 } from "../../typechain/PoseidonT3";
import { PoseidonT3__factory } from "../../typechain/factories/PoseidonT3__factory";
import { PoseidonT4 } from "../../typechain/PoseidonT4";
import { PoseidonT4__factory } from "../../typechain/factories/PoseidonT4__factory";
import { PoseidonT5 } from "../../typechain/PoseidonT5";
import { PoseidonT5__factory } from "../../typechain/factories/PoseidonT5__factory";
import { PoseidonT6 } from "../../typechain/PoseidonT6";
import { PoseidonT6__factory } from "../../typechain/factories/PoseidonT6__factory";
import { PollFactoryLibraryAddresses } from "../../typechain/factories/PollFactory__factory";

export default async function getPoseidonLibraries(deployer: Signer): Promise<PollFactoryLibraryAddresses>{

  const PoseidonT3Factory = new PoseidonT3__factory(deployer);
  const PoseidonT4Factory = new PoseidonT4__factory(deployer);
  const PoseidonT5Factory = new PoseidonT5__factory(deployer);
  const PoseidonT6Factory = new PoseidonT6__factory(deployer);
  const poseidonT3 = await PoseidonT3Factory.deploy();
  const poseidonT4 = await PoseidonT4Factory.deploy();
  const poseidonT5 = await PoseidonT5Factory.deploy();
  const poseidonT6 = await PoseidonT6Factory.deploy();

  return {
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]: poseidonT5.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]: poseidonT3.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]: poseidonT6.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]: poseidonT4.address,
    }
}
