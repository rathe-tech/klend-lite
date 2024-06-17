import * as css from "./section.css";

const Wrapper = ({ children }: { children?: React.ReactNode }) =>
  <div className={css.wrapper}>
    {children}
  </div>

const Header = ({ children }: { children?: React.ReactNode }) =>
  <div className={css.section.header}>
    <Wrapper>
      {children}
    </Wrapper>
  </div>

const Body = ({ children }: { children?: React.ReactNode }) =>
  <div className={css.section.body}>
    <Wrapper>
      {children}
    </Wrapper>
  </div>

export const Section = {
  Header,
  Body,
};