from torch import nn


class LeNet(nn.Module):

    def __init__(self):
        super(LeNet, self).__init__()
        # convolution
        self.c1 = nn.Conv2d(1, 6, kernel_size=(5, 5), stride=(1, 1))
        self.c3 = nn.Conv2d(6, 16, kernel_size=(5, 5), stride=(1, 1))
        self.c5 = nn.Conv2d(16, 120, kernel_size=(5, 5), stride=(1, 1))

        # sample
        self.s2 = nn.MaxPool2d(kernel_size=(2, 2), stride=2, padding=0, dilation=1, ceil_mode=False)
        self.s4 = nn.MaxPool2d(kernel_size=(2, 2), stride=2, padding=0, dilation=1, ceil_mode=False)

        # activation
        self.relu = nn.ReLU()

        # fully connect
        self.fc6 = nn.Linear(120, 84)
        self.fc7 = nn.Linear(84, 26)

    def forward(self, x):
        x = self.c1(x)
        x = self.relu(x)

        x = self.s2(x)
        x = self.c3(x)
        x = self.relu(x)

        x = self.s4(x)
        x = self.c5(x)
        x = self.relu(x)

        x = x.view(x.shape[0], -1)

        x = self.fc6(x)
        x = self.relu(x)
        x = self.fc7(x)

        return x
