import { Input, Button, Layout, Radio, Typography } from 'antd';
import { styled } from 'styled-components';

const { Title } = Typography;

const { Header, Footer, Sider, Content } = Layout;
const headerStyle = {
  textAlign: 'left',
  color: 'white',
  height: 200,
  backgroundColor: '#00102A',
  lineHeight: '10px'
};

const contentStyle = {
  textAlign: 'center',
  lineHeight: '60px',
  color: 'black',
  backgroundColor: '#papayawhip',
  justifyContent: 'center'
};

const CustomInput = styled(Input)`
  margin-top: 0;
`

const CustomButton = styled(Button)`
  width: 15%
`
const Container = styled.div`
  margin: auto;
  width: 70%;
  text-align: center;
`;

export  {
    Header,
    Content,
    Footer,
    Layout,
    Button,
    headerStyle,
    contentStyle,
    CustomInput,
    CustomButton,
    Container,
    Title,
    Radio
}