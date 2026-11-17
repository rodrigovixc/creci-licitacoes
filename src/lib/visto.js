// Diz quando um elemento entrou na tela pela primeira vez. Usado para disparar uma animação uma vez só.
import { useEffect, useRef, useState } from 'react'

export function useVisto(margem = '0px 0px -15% 0px') {
  const ref = useRef(null)
  const [visto, setVisto] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setVisto(true), io.disconnect()), { rootMargin: margem })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [margem])
  return [ref, visto]
}
