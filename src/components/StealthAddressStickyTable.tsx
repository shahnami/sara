import { Table } from "@mantine/core";
import { Address } from "@typing/index";
import { truncateEthAddress } from "@utils/index";
import { CopyWithCheckButton } from "./common/CopyButton";

interface ComponentProps {
  items: {
    nonce: string;
    stealthSafeAddress: Address;
    stealthSignerAddress: Address;
    stealthSignerKey: Address;
    balances: {
      ETH: string;
      USDT: string;
      USDC: string;
      DAI: string;
    };
    status: string;
  }[];
}

export const StealthAddressStickyTable = (props: ComponentProps) => {
  const rows = props.items.map((item) => (
    <Table.Tr key={item.nonce}>
      <Table.Td>{item.nonce}</Table.Td>
      <Table.Td>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {truncateEthAddress(item.stealthSafeAddress)}
          <CopyWithCheckButton value={item.stealthSafeAddress} />
        </div>
      </Table.Td>
      <Table.Td>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {truncateEthAddress(item.stealthSignerAddress)}
          <CopyWithCheckButton value={item.stealthSignerAddress} />
        </div>
      </Table.Td>
      <Table.Td>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {truncateEthAddress(item.stealthSignerKey)}
          <CopyWithCheckButton value={item.stealthSignerKey} />
        </div>
      </Table.Td>
      {props.items.length > 0 && Object.values(props.items[0].balances).some((balance) => balance !== "-") && (
        <>
          <Table.Td>{item.balances.ETH}</Table.Td>
          <Table.Td>{item.balances.USDT}</Table.Td>
          <Table.Td>{item.balances.USDC}</Table.Td>
          <Table.Td>{item.balances.DAI}</Table.Td>
        </>
      )}
      <Table.Td>{item.status}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer
      minWidth="100%"
      style={{ width: "100%", maxHeight: "40vh", overflowY: "scroll" }}
    >
      <Table
        striped={true}
        highlightOnHover={true}
        withColumnBorders={true}
        stickyHeader={true}
        withTableBorder={true}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nonce</Table.Th>
            <Table.Th>Safe Address</Table.Th>
            <Table.Th>Signer Address</Table.Th>
            <Table.Th>Signer Key</Table.Th>
            {props.items.length > 0 && Object.values(props.items[0].balances).some(
              (balance) => balance !== "-"
            ) && (
              <>
                <Table.Th>ETH</Table.Th>
                <Table.Th>USDC</Table.Th>
                <Table.Th>USDT</Table.Th>
                <Table.Th>DAI</Table.Th>
              </>
            )}
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
