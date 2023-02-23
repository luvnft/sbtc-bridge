/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { uintCV, stringAsciiCV, tupleCV, bufferCVFromString, principalCV } from 'micro-stacks/clarity';
import { PostConditionMode } from 'micro-stacks/transactions';

export const coordinator = {
	stxAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
	btcAddress: 'tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e' //'2N8fMsws2pTGfNzkFTLWdUYM5RTWEAphieb''tb1qnzqsylm7xv2svujkqunj20t7zs7l67n85pj8qf'  // electrum1
}

export async function mintTo(contractCall:any, amount:number, stxAddress: string, btcTxId: string) {
  //data {addr: principal, key: (buff 33)}
  const btcAddressCV = stringAsciiCV(btcTxId);
  const stxAddressCV = principalCV(stxAddress);
  const functionArgs = [uintCV(amount), stxAddressCV, btcAddressCV]
  await contractCall.openContractCall({
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
    contractAddress: import.meta.env.VITE_SBTC_DEPLOYER_ADDRESS,
    contractName: 'sbtc-alpha',
    functionName: 'mint!',
    functionArgs: functionArgs,
    onFinish: (data: any) => {
      console.log('TX Data: ', data);
      return data;
    },
    onCancel: () => {
      console.log('popup closed!');
    }
  });
}

export async function burnFrom(contractCall:any, amount:number, stxAddress: string, btcTxId: string) {
  //data {addr: principal, key: (buff 33)}
  const btcAddressCV = stringAsciiCV(btcTxId);
  const stxAddressCV = principalCV(stxAddress);
  const functionArgs = [uintCV(amount), stxAddressCV, btcAddressCV]
  await contractCall.openContractCall({
    postConditions: [],
    postConditionMode: PostConditionMode.Allow,
    contractAddress: import.meta.env.VITE_SBTC_DEPLOYER_ADDRESS,
    contractName: 'sbtc-alpha',
    functionName: 'burn!',
    functionArgs: functionArgs,
    onFinish: (data: any) => {
      console.log('TX Data: ', data);
      return data;
    },
    onCancel: () => {
      console.log('popup closed!');
    }
  });
}

export async function setCoordinator(contractCall:any) {
  //data {addr: principal, key: (buff 33)}
  const datum = tupleCV({
    addr: principalCV(coordinator.stxAddress),
    key: bufferCVFromString('33 max byte buffer')
  });
  const functionArgs = [datum]
  await contractCall.openContractCall({
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
    contractAddress: import.meta.env.VITE_SBTC_DEPLOYER_ADDRESS,
    contractName: 'sbtc-alpha',
    functionName: 'set-coordinator-data',
    functionArgs: functionArgs,
    onFinish: (data: any) => {
      console.log('TX Data: ', data);
      return data;
    },
    onCancel: () => {
      console.log('popup closed!');
    }
  });
}

export async function setBtcWallet(contractCall:any) {
  const datum = stringAsciiCV(coordinator.btcAddress)
  const functionArgs = [datum]
  await contractCall.openContractCall({
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
    contractAddress: import.meta.env.VITE_SBTC_DEPLOYER_ADDRESS,
    contractName: 'sbtc-alpha',
    functionName: 'set-bitcoin-wallet-address',
    functionArgs: functionArgs,
    onFinish: (data: any) => {
      console.log('TX Data: ', data);
      return data;
    },
    onCancel: () => {
      console.log('popup closed!');
    }
  });
}

