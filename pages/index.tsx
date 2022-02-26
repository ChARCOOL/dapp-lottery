import { Contract, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import LotteryJSON from '../artifacts/contracts/Lottery.sol/Lottery.json'

declare let window: {
  ethereum: ethers.providers.ExternalProvider
}

export default function HomePage() {
  const [walletAddr, setWalletAddr] = useState('0x0')
  const [lotteryContr, setLotteryContr] = useState<ethers.Contract>()
  const [lotteryPot, setLotteryPot] = useState('0.0')
  const [lotteryPlayers, setLotteryPlayers] = useState<string[]>([])
  const [lotteryId, setLotteryId] = useState(0)
  const [lotteries, setLotteries] = useState<{ id: number; address: string }[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getPot()
    getPlayers()
    getId()
    getHistory()
  }, [lotteryContr])

  const getPot = async () => {
    if (typeof lotteryContr === 'undefined') return

    const pot = await lotteryContr.getBalance()
    setLotteryPot(ethers.utils.formatEther(pot))
  }

  const getPlayers = async () => {
    if (typeof lotteryContr === 'undefined') return

    const players = await lotteryContr.getPlayers()
    setLotteryPlayers(players)
  }

  const getHistory = async () => {
    if (typeof lotteryContr === 'undefined') return

    const _id = await lotteryContr.lotteryId()

    for (let id = +_id - 1; id > 0; id--) {
      const address = await lotteryContr.lotteries(id)
      const history = { id, address }
      setLotteries((lotteries) => [...lotteries, history])
    }
  }

  const getId = async () => {
    if (typeof lotteryContr === 'undefined') return

    const id = await lotteryContr.lotteryId()
    setLotteryId(id)
  }

  const enterLotteryHandler = async () => {
    if (typeof lotteryContr === 'undefined') return

    try {
      await lotteryContr.enter({
        from: walletAddr,
        value: ethers.utils.parseEther('0.15'),
        gasLimit: 300000,
        gasPrice: null
      })
    } catch (_error) {
      const error = _error as Error
      setError(error.message)
    }
  }

  const pickWinnerHandler = async () => {
    if (typeof lotteryContr === 'undefined') return

    try {
      await lotteryContr.getRandomNumber({
        from: walletAddr,
        gasLimit: 300000,
        gasPrice: null
      })

      await lotteryContr.pickWinner()

      const winner = lotteries[lotteryId - 1].address
      setSuccess(`The winner is ${winner}`)
    } catch (_error) {
      const error = _error as Error
      setError(error.message)
    }
  }

  const connectWalletHandler = async () => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') return

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])

      const signer = provider.getSigner()

      const addr = await signer.getAddress()
      setWalletAddr(addr)

      const contr = new ethers.Contract(
        '0xF06193Da64DaCa5e25532Ccfb876E632aF716b08',
        LotteryJSON.abi,
        signer
      )

      setLotteryContr(contr)
    } catch (_error) {
      const error = _error as Error
      setError(error.message)
    }
  }

  return (
    <div className="px-16 py-8">
      <div className="flex flex-row items-center justify-between mb-16">
        <h1 className="text-4xl font-bold">Ether Lottery</h1>
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-transform outline-none active:scale-95"
          onClick={connectWalletHandler}
        >
          Connect Wallet
        </button>
      </div>
      <div className="flex flex-row items-start justify-between px-8">
        <div>
          <div className="mb-12">
            <p className="mb-3">Enter the lottery by sending 0.01 Ether</p>
            <button
              className="px-6 py-4 bg-[#EEF1FD] text-[#425DB1] text-xl rounded-md transition-transform outline-none active:scale-95"
              onClick={enterLotteryHandler}
            >
              Play now
            </button>
          </div>
          <div className="mb-12">
            <p className="mb-3">
              <span className="font-semibold">Admin only:</span> Pick winner
            </p>
            <button
              className="px-6 py-4 bg-[#EAFDFE] text-[#008370] text-xl rounded-md transition-transform outline-none active:scale-95"
              onClick={pickWinnerHandler}
            >
              Pick winner
            </button>
          </div>
          <p className="text-[#C7585C] mb-12">{error}</p>
          <p className="text-[#6BA990]">{success}</p>
        </div>
        <div>
          <div className="px-10 py-5 shadow-lg mb-6">
            <h2 className="font-medium text-3xl mb-3">Lottery History</h2>
            <ul>
              {lotteries.map((lottery, idx) => (
                <li key={idx}>
                  <span>Lottery #{lottery.id} winner: </span>
                  <a
                    href={`https://etherscan.io/address/${lottery.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lottery.address}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-10 py-5 shadow-lg mb-6">
            <h2 className="font-medium text-3xl mb-3">Players ({lotteryPlayers.length})</h2>
            <ul>
              {lotteryPlayers.map((player, idx) => (
                <li key={idx}>
                  <a
                    href={`https://etherscan.io/address/${player}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {player}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-10 py-5 shadow-lg mb-6">
            <h2 className="font-medium text-3xl mb-3">Pot</h2>
            <p>{lotteryPot} Ether</p>
          </div>
        </div>
      </div>
    </div>
  )
}
