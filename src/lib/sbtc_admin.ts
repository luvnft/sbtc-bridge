/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { CONFIG } from '$lib/config';
import { PostConditionMode, uintCV, stringAsciiCV, bufferCVFromString, type SignedContractCallOptions, AnchorModeNames, makeContractCall, broadcastTransaction, bufferCV } from '@stacks/transactions';
import { tupleCV } from '@stacks/transactions/dist/esm/clarity/index.js';
import { principalCV } from '@stacks/transactions/dist/esm/clarity/types/principalCV.js';
import { openContractCall } from '@stacks/connect';
import { getStacksNetwork } from './stacks_connect.js'
import { hex } from '@scure/base';

export const coordinators = [
  { stxAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5', btcAddress: 'bc1qkj5yxgm3uf78qp2fdmgx2k76ccdvj7rx0qwhv0' }, // devnet + electrum bob
  { stxAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', btcAddress: 'tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e' }, // devnet + electrum bob
  { stxAddress: 'SP3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSQP2HGT6', btcAddress: 'tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e' }, // mijoco staging + electrum bob
  { stxAddress: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN', btcAddress: 'tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e' }, // mijoco production + electrum bob
  { stxAddress: 'ST2BJA4JYFJ7SDMNFJZ9TJ3GB80P9Z80ADNF2R2AG', btcAddress: '' }, // coordinator
  { stxAddress: 'ST306HDPY54T81RZ7A9NGA2F03B8NRGW6Y59ZRZSD', btcAddress: '' }, // coordinator
  { stxAddress: 'ST3RBZ4TZ3EK22SZRKGFZYBCKD7WQ5B8FFRS57TT6', btcAddress: '' }, // coordinator
]

export function getCoordinator(address:string) {
	return coordinators.find((o) => o.stxAddress === address);
}

export function isCoordinator(address:string) {
	return coordinators.find((o) => o.stxAddress === address);
}

export async function mintTo(amount:number, stxAddress: string, btcTxid: string) {
  //data {addr: principal, key: (buff 33)}
  const btcAddressCV = stringAsciiCV(btcTxid);
  const stxAddressCV = principalCV(stxAddress);
  const functionArgs = [uintCV(amount), stxAddressCV, btcAddressCV]
  await openContractCall({
    network: getStacksNetwork(),
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
    contractAddress: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[0],
    contractName: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[1],
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

export async function burnFrom(amount:number, stxAddress: string, btcTxid: string) {
  //data {addr: principal, key: (buff 33)}
  const btcAddressCV = stringAsciiCV(btcTxid);
  const stxAddressCV = principalCV(stxAddress);
  const functionArgs = [uintCV(amount), stxAddressCV, btcAddressCV]
  await openContractCall({
    network: getStacksNetwork(),
    postConditions: [],
    postConditionMode: PostConditionMode.Allow,
    contractAddress: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[0],
    contractName: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[1],
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

export async function setCoordinator(address:string) {
  //data {addr: principal, key: (buff 33)}
  const datum = tupleCV({
    addr: principalCV(address),
    key: bufferCVFromString('33 max byte buffer')
  });

  const functionArgs = [datum]
  await openContractCall({
    network: getStacksNetwork(),
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
    contractAddress: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[0],
    contractName: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[1],
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

export async function setsBTCPublicKey(publicKey:string) {
  const datum = bufferCV(hex.decode(publicKey))
  const functionArgs = [datum]
  await openContractCall({
    network: getStacksNetwork(),
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
    contractAddress: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[0],
    contractName: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[1],
    functionName: 'set-bitcoin-wallet-public-key',
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

export async function setBTCPublicKeyFromprivate(publicKey:string, senderKey:string) {
  //: '6c7316495d181cfd1f62bfb18c6843c06bdb236ba18f87cb923320940ac4cfca01'
  const datum = bufferCV(hex.decode(publicKey))
  const functionArgs = [datum]
  const txOptions:SignedContractCallOptions = {
    network: getStacksNetwork(),
    anchorMode: AnchorModeNames[0],
    postConditions: [],
    senderKey,
    postConditionMode: PostConditionMode.Deny,
    contractAddress: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[0],
    contractName: CONFIG.VITE_SBTC_CONTRACT_ID.split('.')[1],
    functionName: 'set-bitcoin-wallet-public-key',
    functionArgs: functionArgs,
  }
  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, getStacksNetwork());
  return result
}

