import { useNavigate } from '@solidjs/router'
import { Avatar, FormItem, Input, RadioGroup, Space } from 'cui-solid'
import { createSignal } from 'solid-js'
import { routes } from '../router'

const mainRoutes = routes[0].children

export default function Main(props) {
  const [active, setActive] = createSignal(mainRoutes[0].path)

  const navigate = useNavigate()

  const handleChange = (value: string) => {
    setActive(value)
    navigate(value)
  }

  return (
    <main w-full h-full>
      {/* <div w-full pt-10 flex justify-center>
        <RadioGroup
          stick
          block
          value={active()}
          onChange={handleChange}
          data={
            mainRoutes.map(item => ({
              label: item.label,
              value: item.path,
            }))
          }
        />
      </div> */}
      <div w-full h-full>
        {props.children}
      </div>
    </main>
  )
}
