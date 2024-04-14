import styled from 'styled-components';
import Table from '../shared/Table';

const CustomTable = styled(Table)`
  th:nth-child(3),
  th:nth-child(5),
  th:nth-child(6) {
    text-align: right;
  }
  th:nth-child(2) {
    padding-right: 0;
  }
  th:nth-child(3) {
    padding-left: 0;
  }
`;

export default CustomTable;
