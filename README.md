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

### GPT Output

```tsx
import { fireEvent, render } from '@testing-library/react'
import { BaseLinks } from '../BaseLinks'

describe('BaseLinks', () => {
  it('renders all UI components for the BaseLinks functional component', () => {
    const { getByTestId } = render(
      <BaseLinks
        links={[]}
        handleClick={function (e: any): void {
          throw new Error('Function not implemented.')
        }}
        selectedLink={''}
      />,
    )
    expect(getByTestId('base-links')).toBeInTheDocument()
  })

  it('calls the handleClick function when clicked', () => {
    const mockHandleClick = jest.fn()

    const { getByTestId } = render(
      <BaseLinks handleClick={mockHandleClick} links={[]} selectedLink={''} />,
    )

    fireEvent.click(getByTestId('base-links'))

    expect(mockHandleClick).toHaveBeenCalledTimes(1)
  })

  it('renders the correct number of links', () => {
    const links = ['Home', 'About', 'Contact']

    const { getAllByTestId } = render(
      <BaseLinks
        links={links}
        handleClick={function (e: any): void {
          throw new Error('Function not implemented.')
        }}
        selectedLink={''}
      />,
    )

    expect(getAllByTestId('base-links').length).toEqual(3)
  })

  it('renders the correct link text', () => {
    const links = ['Home', 'About', 'Contact']

    const { getAllByText } = render(
      <BaseLinks
        links={links}
        handleClick={function (e: any): void {
          throw new Error('Function not implemented.')
        }}
        selectedLink={''}
      />,
    )

    expect(getAllByText('Home')).toBeTruthy()
    expect(getAllByText('About')).toBeTruthy()
    expect(getAllByText('Contact')).toBeTruthy()
  })

  it('applies the correct styles when a link is clicked', () => {
    const mockHandleClick = jest.fn()

    const selectedLink = 'Home'

    const links = ['Home', 'About', 'Contact']

    const { getByText, getAllByText } = render(
      <BaseLinks handleClick={mockHandleClick} selectedLink={selectedLink} links={links} />,
    )

    // Assert that the correct style is applied to the clicked link. In this case, we're checking that the `linkClickedStyle` class is applied. You would want to assert that the other styles are *not* applied as well.
    expect(getByText('Home').classList.contains('linkClickedStyle')).toBeTruthy()

    // Assert that the other links do not have the `linkClickedStyle` class applied.
    expect(getAllByText('About')[0].classList.contains('linkClickedStyle')).toBeFalsy()
    expect(getAllByText('Contact')[0].classList.contains('linkClickedStyle')).toBeFalsy()
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
