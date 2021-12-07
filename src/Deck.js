import React, { useEffect, useState, useRef } from "react"
import Card from './Card'
import axios from 'axios'
import './Deck.css'

function Deck() {
    const [deck, setDeck] = useState(null)
    const [drawn, setDrawn] = useState([])
    const [autoDraw, setAutoDraw] = useState(false)
    const timerRef = useRef(null)

    //loading deck from API into state
    useEffect(() => {
        async function getAPIData() {
            let res = await axios.get("http://deckofcardsapi.com/api/deck/new/shuffle/")
            setDeck(res.data)
        }
        getAPIData()
    }, [setDeck])

    //draw one card every second if autoDraw activated
    //draw a card and add card to state "drawn" list

    useEffect(()=> {
        async function drawCard() {
            let { deck_id } = deck

            let drawRes = await axios.get(`http://deckofcardsapi.com/api/deck/${deck_id}/draw/`)
            //when there are no more cards left from the deck
            if (drawRes.data.remaining === 0) {
                setAutoDraw(false)
                alert('Error: No cards remaining!')
            }

            const card = drawRes.data.cards[0]

            setDrawn(d => [
                ...d,
                {
                    id: card.code,
                    name: card.value + 'of' + card.suit,
                    image: card.image
                }
            ])
        }

        //if autoDraw is true, automatically draw a card every second
        if (autoDraw && !timerRef.current) {
            timerRef.current = setInterval(async () => {
                await drawCard()
            }, 1000)
        }

        return () => {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [autoDraw, setAutoDraw, deck])

    const toggleAutoDraw = () => {
        setAutoDraw(auto => !auto)
    }

    const cards = drawn.map(c=> (
        <Card name={c.name} image={c.image} />
    ))

    return (
        <div className="Deck">
            {deck ? (
                <button className="Deck-auto" onClick={toggleAutoDraw}>
                    {autoDraw ? "Stop" : "Start" } Drawing
                </button>
            ) : null }
            <div className="Deck-cardpile">{cards}</div>
        </div>
    )
}


export default Deck