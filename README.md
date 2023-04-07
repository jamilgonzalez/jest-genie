# JestGenie: A TypeScript React Test Generator for VS Code using GPT API

## What it Does

JestGenie is a tool that uses OpenAI's GPT technology to generate test cases for software programs written in typescript. 

Developers can highlight a function they want to generate a test for, right click and activate the plugin from the menu saving them time and effort.

### Sample FC with Prop Type

```tsx
export interface BaseLinkProps {
  links: string[]
  handleClick: (e: any) => void
  selectedLink: string
}

export const BaseLinks: React.FC<BaseLinkProps> = ({ handleClick, links, selectedLink }) => {
  return (
    <Grid
      container
      className={classNames(styles.baseLinkContainer)}
      spacing={3}
      justifyContent="center"
    >
      {links.map((link: string, i: number) => {
        const clicked = link.toLowerCase() === selectedLink.toLowerCase()

        return (
          <Grid key={i} item alignItems="center">
            <Link
              key={i}
              onClick={(e: any) => handleClick(e)}
              underline={clicked ? 'always' : 'none'}
              className={
                clicked ? classNames(styles.linkClickedStyle) : classNames(styles.defaultLinkStyle)
              }
            >
              {link}
            </Link>
          </Grid>
        )
      })}
    </Grid>
  )
}
```

### jest-genie Output

```tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { BaseLinks, BaseLinkProps } from '../BaseLinks'

describe('BaseLinks', () => {
  const handleClick = jest.fn()
  const links: string[] = ['Link 1', 'Link 2', 'Link 3']
  const selectedLink: string = 'Link 2'

  const props: BaseLinkProps = {
    handleClick,
    links,
    selectedLink,
  }

  it('renders all links', () => {
    const { getByText } = render(<BaseLinks {...props} />)
    links.forEach((link) => expect(getByText(link)).toBeInTheDocument())
  })

  it('calls handleClick when a link is clicked', () => {
    const { getByText } = render(<BaseLinks {...props} />)
    fireEvent.click(getByText(selectedLink))
    expect(handleClick).toHaveBeenCalled()
  })

  it('underlines the selected link', () => {
    const { getByText } = render(<BaseLinks {...props} />)
    expect(getByText(selectedLink)).toHaveStyle('text-decoration: underline')
  })

  it('does not underline unselected links', () => {
    const { getByText } = render(<BaseLinks {...props} />)
    links
      .filter((link) => link !== selectedLink)
      .forEach((link) => expect(getByText(link)).not.toHaveStyle('text-decoration: underline'))
  })
})
```

## OpenAI GPT

OpenAI's GPT (Generative Pre-trained Transformer) is a powerful tool for generating natural language text. 

## Running JestGenie

### Package Manager

The Project uses Yarn. If you have it installed you can skip these instructions. To Install Yarn, follow these steps:

**Installing yarn**

1. Go to the [Yarn installation page](https://classic.yarnpkg.com/en/docs/install/).
2. Select your operating system from the list of options.
3. Follow the instructions for your operating system to download and install Yarn.

Once Yarn is installed

1. Run `yarn install` to install all of the project dependencies
2. Then run `yarn start` to compile the project in watch mode
3. Hit `F5` and at the top of the vscode you should see a dropdown    
4. Select “VS Code Extension Development” to run the extension
