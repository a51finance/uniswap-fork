import { Trans } from '@lingui/macro'
import { InterfaceElementName } from '@uniswap/analytics-events'
import Column from 'components/Column'
import { LoaderV2 } from 'components/Icons/LoadingSpinner'
import { AutoRow } from 'components/Row'
import { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { BREAKPOINTS } from 'theme'
import { ThemedText } from 'theme/components'

import { ActivityTab } from './Activity'
import { usePendingActivity } from './Activity/hooks'
import { PortfolioRowWrapper } from './PortfolioRow'
import Tokens from './Tokens'

const Wrapper = styled(Column)`
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;

  @media screen and (max-width: ${BREAKPOINTS.sm}px) {
    margin-bottom: 48px;
  }

  ${PortfolioRowWrapper} {
    &:hover {
      background: ${({ theme }) => theme.deprecated_hoverDefault};
    }
  }
`

const Nav = styled(AutoRow)`
  gap: 20px;
`

const NavItem = styled(ThemedText.SubHeader)<{ active?: boolean }>`
  align-items: center;
  color: ${({ theme, active }) => (active ? theme.neutral1 : theme.neutral2)};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} color`};

  &:hover {
    ${({ theme, active }) => !active && `color: ${theme.neutral2}`};
  }
`

const PageWrapper = styled.div`
  border-radius: 12px;
  margin-right: -16px;
  margin-left: -16px;
  width: calc(100% + 32px);
  flex: 1;
`

interface Page {
  title: React.ReactNode
  key: string
  component: ({ account }: { account: string }) => JSX.Element
  loggingElementName: string
}

const Pages: Array<Page> = [
  {
    title: <Trans>Tokens</Trans>,
    key: 'tokens',
    component: Tokens,
    loggingElementName: InterfaceElementName.MINI_PORTFOLIO_TOKENS_TAB,
  },
  {
    title: <Trans>Activity</Trans>,
    key: 'activity',
    component: ActivityTab,
    loggingElementName: InterfaceElementName.MINI_PORTFOLIO_ACTIVITY_TAB,
  },
]

export default function MiniPortfolio({ account }: { account: string }) {
  const theme = useTheme()
  const [currentPage, setCurrentPage] = useState(0)
  const [activityUnread, setActivityUnread] = useState(false)

  const { component: Page, key: currentKey } = Pages[currentPage]

  const { hasPendingActivity } = usePendingActivity()

  useEffect(() => {
    if (hasPendingActivity && currentKey !== 'activity') setActivityUnread(true)
  }, [currentKey, hasPendingActivity])

  return (
    <Wrapper>
      <Nav data-testid="mini-portfolio-navbar">
        {Pages.map(({ title, key }, index) => {
          const isUnselectedActivity = key === 'activity' && currentKey !== 'activity'
          const showActivityIndicator = isUnselectedActivity && (hasPendingActivity || activityUnread)
          const handleNavItemClick = () => {
            setCurrentPage(index)
            if (key === 'activity') setActivityUnread(false)
          }
          return (
            <NavItem onClick={handleNavItemClick} active={currentPage === index} key={key}>
              <span>{title}</span>
              {showActivityIndicator && (
                <>
                  &nbsp;
                  {hasPendingActivity ? (
                    <LoaderV2 />
                  ) : (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="4" cy="4" r="4" fill={theme.accent1} />
                    </svg>
                  )}
                </>
              )}
            </NavItem>
          )
        })}
      </Nav>
      <PageWrapper data-testid="mini-portfolio-page">
        <Page account={account} />
      </PageWrapper>
    </Wrapper>
  )
}
