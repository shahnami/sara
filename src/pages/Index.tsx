import { useState } from "react";
import { Button } from "@mantine/core";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { IconBrandGithub } from "@tabler/icons-react";

import { Card } from "@components/common/Card";
import { Header } from "@components/common/Header";
import { Section } from "@components/common/Section";
import { Footer } from "@components/common/Footer";
import { StealthAddressStickyTable } from "@components/StealthAddressStickyTable";
import { Journey } from "@components/Journey";

import { Address } from "@typing/index";

export const Index = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [stealthAddressData, setStealthAddressData] = useState<string[][]>([]);

  const handleGithubRedirect = () => {
    open("https://github.com/shahnami/sara", "_blank");
  };

  return (
    <>
      <Header>
        <h3>Stealth Account Recovery Assistant</h3>
        <ConnectButton showBalance={false} />
      </Header>
      <Section>
        <Card>
          <Journey
            onStepChanged={(step: number) => setActiveStep(step)}
            onStealthDataProcessed={(data: string[][]) =>
              setStealthAddressData(data)
            }
          />
        </Card>
        <Card hidden={activeStep < 3}>
          <StealthAddressStickyTable
            items={stealthAddressData.slice(1).map((v) => {
              return {
                nonce: v[0],
                stealthSafeAddress: v[1] as Address,
                stealthSignerAddress: v[2] as Address,
                stealthSignerKey: v[3] as Address,
                balances: {
                  ETH: v[4],
                  USDT: v[5],
                  USDC: v[6],
                  DAI: v[7],
                },
                status: v[8],
              };
            })}
          />
        </Card>
      </Section>
      <Footer>
        <p>
          Learn more about the mission, values, and the team behind{" "}
          <a href="https://fluidkey.com" target="_blank">
            FluidKey
          </a>
          .
        </p>
        <p>
          <Button
            color="#191919"
            onClick={handleGithubRedirect}
            leftSection={<IconBrandGithub />}
          >
            GitHub
          </Button>
        </p>
      </Footer>
    </>
  );
};
